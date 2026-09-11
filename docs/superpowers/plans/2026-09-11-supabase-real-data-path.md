# Supabase Real-Data Path — Planning Doc

**Status:** planning artifact, not wired into the shell. Demo mode stays the no-backend path.
**Date:** 2026-09-11
**Author:** Phase 3 deliverable (Intellectro UI expansion)
**Repo root:** `/c/Users/Admin/OneDrive/Desktop/intellectro-live`

---

## 1. Decision

The Intellectro web shell currently runs in demo mode: a static
`demoStore` (localStorage-backed) plus `demoData` (static feed, authors,
comments). When `hasSupabaseEnv()` is false — the default, because
`.env.example` leaves `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` empty — the shell uses these
demos and never touches a network.

This doc sketches what happens when `hasSupabaseEnv()` becomes true:
the shell reads and writes real rows in a Supabase project, and the
`deriveTrustContext`-equivalent computation runs over real tables
instead of the seeded demo shapes.

The demo path is **not** removed. It remains the no-backend fallbacks.
This doc is a planning artifact; it does not ship any wiring.

---

## 2. Supabase wiring already present

All of the following already exists on disk and is unchanged by this
planning doc:

- `apps/web/lib/supabase/env.js` — `hasSupabaseEnv()` and
  `getSupabasePublicConfig()`. Both derive from
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  only. No other env keys are referenced.
- `apps/web/lib/supabase/client.js` — `createBrowserClient` from
  `@supabase/ssr`, guarded: throws if the public env is not configured.
- `apps/web/lib/supabase/server.js` — `createServerClient` from
  `@supabase/ssr` + `next/headers` cookies, same guard.
- `.env.example` — both values empty. No secrets committed.

The only credential surface is the public publishable key. There is no
service-role key anywhere in the repo, and this doc does not add one.

---

## 3. Real data path, component by component

This section describes what each shell component would read or write
when `hasSupabaseEnv()` is true. Column names and vocabularies below
come from the migration
`supabase/migrations/20260911030000_social_vertical_slice.sql` and
from the packages that define the same vocabulary in code
(`@intellectro/social-core`, `packages/governance`, the action-event
schema). Where the migration check constraint and the in-code set agree,
that agreement is the source of truth for the vocabulary.

### 3.1 Authentication

- Client components use `createBrowserClient()` from
  `apps/web/lib/supabase/client.js`. Server reads use
  `createServerClient()` from `apps/web/lib/supabase/server.js`.
- Both functions read only the public publishable key. No service-role
  key.
- The existing `hasSupabaseEnv()` guard already prevents accidental
  calls when the env is not configured. The real path lives behind that
  same gate.

### 3.2 Posts

- Table: `public.posts`.
- Columns used: `id`, `space_id`, `author_id`, `body`, `kind`,
  `ai_assisted`, `ai_assistance_type`, `agent_id`, `human_approved`,
  `created_at`.
- `kind` vocabulary: `human | source_linked | ai_assisted`. This is
  the migration check constraint (`kind in ('human','source_linked','ai_assisted')`)
  **and** the `POST_KINDS` set in `@intellectro/social-core`. The UI
  maps a real row to the `createSocialPost`-compatible shape that
  `PostCard` and `deriveTrustContext` already expect.
- `ai_assisted` boolean + `ai_assistance_type` text + `agent_id` text
  together describe the assistance. `human_approved` boolean records
  whether a human approved the agent output.
- Read policy: `posts authenticated read` — `to authenticated using (true)`.
  Any authenticated user can read any post. This is the public-read
  posture that matches the current feed.

### 3.3 Comments

- Table: `public.comments`.
- Columns: `id`, `post_id`, `author_id`, `body`, `created_at`.
- Author display name comes from `public.profiles` (join on
  `author_id` → `profiles.id`, read `handle` and `display_name`).
- `comments` read policy is public-read for authenticated users
  (`comments authenticated read`). Write is owner-scoped
  (`comments own insert` with `auth.uid() = author_id`).

### 3.4 Claim responses

- Table: `public.claim_responses`.
- Columns: `id`, `post_id`, `author_id`, `response_type`, `body`,
  `created_at`.
- `response_type` vocabulary: `support | challenge | qualify |
  add_evidence | ask_question`. This is the migration check constraint
  **and** the `RESPONSE_TYPES` array in `apps/web/lib/response-types.js`.
  The two are the same set; the UI imports from the lib, and the
  migration enforces the same values on the server.
- Read policy: `claim responses authenticated read` — public-read for
  authenticated users. Write is owner-scoped (`claim responses own insert`
  with `auth.uid() = author_id`).

### 3.5 Reactions

- Table: `public.reactions`.
- Columns: `post_id`, `user_id`, `reaction`, `created_at`.
- Primary key: `(post_id, user_id, reaction)`.
- `reaction` vocabulary: `like | useful | interesting` (migration check
  constraint).
- Read policy: `reactions authenticated read` — public-read for
  authenticated users. Write is owner-scoped (`reactions own insert`
  with `auth.uid() = user_id`).

### 3.6 Sources and post_sources

- Tables: `public.sources` (source records) and `public.post_sources`
  (many-to-many linkage).
- `sources` columns: `id`, `created_by`, `url`, `title`, `publisher`,
  `published_at`, `created_at`.
- `post_sources` columns: `post_id`, `source_id`, `added_by`,
  `created_at`. Primary key `(post_id, source_id)`.
- Read policy on both is public-read for authenticated users;
  writes are owner-scoped (`sources own insert` with `auth.uid() = created_by`,
  `post sources own insert` with `auth.uid() = added_by`).

### 3.7 Provenance records

- Table: `public.provenance_records`.
- Columns: `id`, `post_id`, `source_refs` (jsonb),
  `transformations` (jsonb), `generated_at`, `created_at`.
- Read policy: `provenance authenticated read` — public-read for
  authenticated users. (No owner-scoped write policy is defined in the
  migration slice; provenance is written by the system, not by end users
  in this alpha.)

### 3.8 Agent actions and approval records

This is the data behind the Phase-4 moderator queue and action log.

- Table: `public.agent_actions`.
- Columns: `id`, `agent_id`, `owner_id`, `space_id`, `action`,
  `capability`, `policy_version`, `approval_status`, `input_refs`
  (jsonb), `output_refs` (jsonb), `created_at`.
- `approval_status` vocabulary: `not_required | pending | approved |
  rejected`. This is the migration check constraint **and** the
  `approval_status` enum in `governance/action-event.schema.json`
  (`["not_required","pending","approved","rejected"]`). It is also the
  set validated by `packages/governance/src/action-event.js`
  (`assertActionEvent` checks `approval_status` against the same four
  values).
- `agent_actions` read policy is **owner-read only**:
  `agent actions owner read` — `to authenticated using (auth.uid() = owner_id)`.
  A user can only read their own agent actions, not anyone else's.
- Table: `public.approval_records`.
- Columns: `id`, `action_id`, `approver_id`, `decision`, `note`,
  `created_at`. Unique `(action_id, approver_id)`.
- `decision` vocabulary: `approved | rejected` (migration check constraint).
- Read policy: `approval action owner read` — scoped to the action's
  owner via an exists subquery on `agent_actions.owner_id`. A user sees
  approval records only for actions they own.
- Insert policy: `approval human insert` — `with check (auth.uid() = approver_id)`.

The action-event vocabulary in code matches the tables:

- `packages/governance/src/action-event.js`:
  `assertActionEvent` requires `event_type = 'agent_action'`,
  `action_id`, `actor_id`, `owner_id`, `action`, `scope`,
  `policy_version`, `capabilities_used` (array, `minItems: 1`),
  `approval_status` in `{not_required, pending, approved, rejected}`,
  and an ISO `timestamp`. `createActionEvent` freezes the result.
- `governance/action-event.schema.json`: `event_type` const
  `agent_action`; `capabilities_used` minItems 1; `approval_status`
  enum as above; `rate_limit_decision` enum
  `[allowed, denied, not_applicable]`.
- `packages/governance/src/policy.js`:
  `validateAgentPrincipal` requires an agent principal to resolve to an
  accountable owner (`principal.ownerId`). `decideCapability` returns
  `{ decision: 'allow' | 'deny' | 'approval_required', reason,
  capability, policyVersion }`.
- `governance/capability-matrix.yaml`: default `deny`; principles
  include `accountable_owner_required`, `typed_capability_required`,
  `public_action_attribution_required`,
  `high_impact_action_requires_reversibility_or_approval`,
  `automated_actions_rate_limited`,
  `preserve_ai_transformation_provenance`,
  `policy_version_required_for_moderation`, `self_escalation: deny`.
  Agent capabilities: `community_agent` and `claim_agent` both have
  `draft_public_content: approval_required`,
  `publish_public_content: approval_required`;
  `delete_content`, `ban_user`, `change_policy`,
  `create_or_invite_agent`, `grant_capability` are all `deny`.
  `alpha_constraints`: `autonomous_public_posting: deny`,
  `autonomous_banning: deny`, `autonomous_deletion: deny`,
  `autonomous_policy_change: deny`.

### 3.9 RLS summary

All runtime tables in the migration slice have RLS enabled. The policy
posture is:

- Public-read on most tables for authenticated users: profiles, spaces,
  space_memberships, posts, comments, reactions, claim_responses,
  sources, post_sources, provenance_records.
- Owner-scoped write on: posts, comments, reactions,
  claim_responses, sources, post_sources.
- Owner-read on `agent_actions` (`auth.uid() = owner_id`).
- Owner-scoped read on `approval_records` (exists subquery on the
  action's owner). Owner-scoped insert on `approval_records`
  (`auth.uid() = approver_id`).

This means that when the real path is wired, the client never sees
another user's rows for owner-scoped tables. The public-read tables are
the ones the feed and side panels read from; the owner-scoped tables are
the ones the composer, reaction bar, source linker, and approval flow
write to.

---

## 4. The `deriveTrustContext` equivalent on real rows

Today `deriveTrustContext` reads from the demo post shape (seeded
`aiAssistance`, `disputeSummary`, `sourceIds`). On real rows the same
signals come from tables:

- `aiAssisted`: derived from `ai_assisted = true` **and** the presence
  of `ai_assistance_type` / `agent_id`. A row with `ai_assisted = false`
  or with null assistance fields is not AI-assisted.
- `humanApproved`: derived from `human_approved = true`.
- `sourceCount`: a `post_sources` count join on `post_id`.
- Dispute signals from a `claim_responses` aggregate grouped by
  `post_id` + `response_type`:
  - `challenge` → challenges count
  - `qualify` → qualifications count
  - `ask_question` → unresolved questions count
  - `support` → no dispute signal (counted separately if needed)
  - `add_evidence` → evidence count
- The aggregate is a **read-time computation**, not a stored column.
  The migration does not add a materialized dispute counter; the UI
  computes it from `claim_responses` at read time.

This keeps the existing `TrustChip` and `ContextResponseBar` vocabulary
unchanged: the same fields flow into the same chips and the same
response bar, only the data source changes.

---

## 5. What changes in the shell when real data is wired

When `hasSupabaseEnv()` is true, the following swaps occur (this is the
planned path, not the current state):

- `page.js` switches from `demoFeed` / `demoAuthors` / `demoStore` to
  Supabase reads for the feed, author profiles, comments, claim
  responses, reactions, and sources. The `demoModeNote` wording
  already flips based on `hasSupabaseEnv()`; the real path uses the
  authenticated branch.
- `PostCard` gets a real author profile from `public.profiles` instead
  of the static `demoAuthors` map.
- `CommentThread` reads/writes `public.comments`.
- `ClaimResponseComposer` writes `public.claim_responses`.
- `ReactionBar` reads/writes `public.reactions`.
- `SourceLinker` reads/writes `public.sources` + `public.post_sources`.
- `CommunityStatePanel` computes from real rows (post count, member
  count from `space_memberships`, pending approvals from
  `agent_actions` with `approval_status = 'pending'`).
- `ModeratorQueue` reads `agent_actions` with `approval_status = 'pending'`
  for the space.
- `ActionLogViewer` reads `agent_actions` + `approval_records` for the
  space — scoped to the current user's owned actions by RLS.

---

## 6. What does NOT change

The following are fixed by the migration, social-core, and
capability-matrix, not by the UI, and do not change when the real path
is wired:

- The design language (dark shell, existing CSS variables,
  `apps/web/app/globals.css`).
- The trust-chip vocabulary.
- The response-type vocabulary
  (`support | challenge | qualify | add_evidence | ask_question`).
- The reaction vocabulary (`like | useful | interesting`).
- The `approval_status` vocabulary
  (`not_required | pending | approved | rejected`).
- The deny-by-default posture (`governance/capability-matrix.yaml:
  default: deny`).
- The no-autonomous-public-posting constraint
  (`alpha_constraints: autonomous_public_posting: deny`).
- The agent-principal rule that an agent must resolve to an accountable
  owner (`packages/governance/src/policy.js: validateAgentPrincipal`).

---

## 7. Security boundary

- The web shell uses only the **public publishable key** from
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. There is no service-role key
  in the repo, and this doc does not introduce one.
- `.env.example` leaves both public values empty; no real credentials
  are committed anywhere.
- RLS enforces row ownership on owner-scoped tables. The client never
  sees another user's rows for those tables, because the policies read
  `auth.uid() = owner_id` (or the equivalent exists subquery for
  `approval_records`).
- Public-read tables are intentionally readable by any authenticated
  user — that is the feed model. The owner-scoped tables are the write
  surface and the action/approval surface.

---

## 8. Open questions (not solved in this phase)

- **Pagination.** The feed is currently chronological with no ranking
  model. Fine for alpha; a real feed with many posts needs pagination or
  cursor-based reads.
- **Aggregate performance.** The `deriveTrustContext`-equivalent
  aggregate over `claim_responses` grouped by `post_id` + `response_type`
  is a read-time computation. On large feeds this may need caching or a
  materialized view.
- **Materialized dispute counts.** Whether claim-response dispute counts
  should be cached as a materialized view is an open question, not a
  decision in this doc.
- **Real-time refresh for the moderator queue.** The pending-actions
  queue could refresh by polling or by push (Postgres changes, Realtime,
  or manual refresh). Which approach fits the alpha is undecided.

---

## 9. Files referenced

- `apps/web/lib/supabase/env.js`
- `apps/web/lib/supabase/client.js`
- `apps/web/lib/supabase/server.js`
- `apps/web/lib/demo-store.js`
- `apps/web/lib/demo-data.js`
- `apps/web/lib/response-types.js`
- `apps/web/app/page.js`
- `apps/web/components/context-response-bar.js`
- `apps/web/components/post-card.js`
- `supabase/migrations/20260911030000_social_vertical_slice.sql`
- `packages/governance/src/policy.js`
- `packages/governance/src/action-event.js`
- `governance/capability-matrix.yaml`
- `governance/action-event.schema.json`
- `.env.example`

## 10. Out of scope for this doc

- Wiring any of the real path into the shell. This doc stays a planning
  artifact.
- Adding new npm packages.
- Adding secrets or credentials of any kind.
- Changing the design system, trust-chip vocabulary, response-type
  vocabulary, reaction vocabulary, approval_status vocabulary, or the
  deny-by-default posture.
