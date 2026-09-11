# Intellectro UI Expansion — Phase 3: Demo-Mode UX + Trust/Governance UX Honesty

**Goal:** make the shell's demo-mode story honest and make the governance language in-shell precise, plus write the Supabase real-data-path planning doc (not wired into the shell — demo mode stays the no-backend path).

**Repo truth (verify yourself before relying on any cached claim):**
- Repo root: `/c/Users/Admin/OneDrive/Desktop/intellectro-live` (git working tree, node_modules at root, node 24.16.0, npm 11.17.0).
- Apps web package: `apps/web` (name `@intellectro/web`, next 16.3.4, react 19.2.8).
- Build command: `npm run build:web` from repo root (workspace-aware; installs to root node_modules).
- Syntax check: `node --check <file>` from repo root. Workspace check: `npm run check` (runs node --check over packages/ agents/ tests/ apps/).
- Design system: `apps/web/app/globals.css` — dark shell, `--accent #70e0b1`, `--accent-strong #a4f7d1`, `--source #85b9ff`, `--ai #c2a4ff`, `--warn #ffc978`, `--muted #92a7a0`. Use existing class names; do not invent a new design system.
- No new npm packages. React 19 hooks only.
- Each component using useState/hooks must be `'use client'`.
- Build gates: every file must pass `node --check`; the full workspace build `npm run build:web` must complete clean (static routes `/` + `/login`, no pending/chunked errors).
- Do NOT touch `LICENSE`/`NOTICE`/`AXIS`. Do NOT add secrets/credentials anywhere, including planning docs.

**Current on-disk state you must not regress (read these files before editing):**
- `apps/web/app/page.js` — imports `PostCard`, `CommunityStatePanel`, `SourceLinker`, `demoAuthors`, `demoFeed`, `demoSpace`, `hasSupabaseEnv`. Right rail renders `<CommunityStatePanel />` + a `side-card` "How to read Intellectro" with a 4-item `read-list`. Composer card renders avatar + placeholder + `Add source` button + `<SourceLinker />`. Feed maps `demoFeed.map((post) => <PostCard ... />)`. The hardcoded 3/0/1 metric card is already replaced by `CommunityStatePanel`.
- `apps/web/components/post-card.js` — imports `deriveTrustContext`, `TrustChip`, `ContextResponseBar`, `CommentThread`, `ClaimResponseComposer`, `demoStore`, `demoComments`, `demoAuthors`, `RESPONSE_LABEL_MAP`. Renders trust chips, context panel (with "Inspect action log" stub button), `ContextResponseBar`, and for non-`ai_assisted` posts: `ClaimResponseComposer` + response list + `CommentThread`.
- `apps/web/components/context-response-bar.js` — stub: Support/Challenge/Qualify + Add evidence, demo note.
- `apps/web/lib/demo-store.js` — `demoStore` static (localStorage-backed) + `useDemoStore()`. APIs: `get()`, `addComment`, `addClaimResponse`, `addReaction`, `toggleReaction`, `getReactionsForPost`, `addSource`, `getSources`, `recordApproval`, `getApprovalsForAction`.
- `apps/web/lib/demo-data.js` — `demoSpace`, `demoFeed` (5 posts), `demoAuthors` (ender/maya/jon), `demoComments` (post-001/002/004).
- `apps/web/lib/response-types.js` — `RESPONSE_TYPES`, `RESPONSE_LABEL_MAP`.

**Phase 3 deliverables (write/modify these files):**

### 3.1 — Make the demo-mode on-ramp honest (page.js)
Edit `apps/web/app/page.js`:
- In the space-hero `<div>`, after the existing `<p>{demoSpace.description}</p>`, add a short governance boundary note as a `<p className="context-note">`. Precise language (do not overclaim): "Provenance records where a thing came from and what happened to it. It is not a verdict. Agent output in this Space requires human approval before publication. The capability posture is deny-by-default. This alpha never fabricates a logged-in session."
- After the `feed-label` div and before the `demoFeed.map(...)`, add a `<p className="context-note">` that says, in demo mode, interactions are stored in this browser only and disappear on reload; configure Supabase to enable persistence and authentication. Use `hasSupabaseEnv()` to decide wording: if configured, say authentication is enabled; if not, say demo mode.
- Update the "How to read Intellectro" `read-list` to reflect the surfaces now present: reading normally, trust chips, context panel, comments, claim responses (support / challenge / qualify / add evidence / ask a question), sources, and the governance pulse panel. Keep it to ~5 items.

### 3.2 — Keep ContextResponseBar honest (no change to its demo nature, but make the stub accurate)
`apps/web/components/context-response-bar.js` already shows Support/Challenge/Qualify + Add evidence + a demo note. Do NOT convert it into a real persistence path in this phase. Instead, edit the demo note to be precise: "In demo mode, selecting a response type is an affordance, not persistence. Connect Supabase to persist claim responses." Leave the component otherwise intact.

### 3.3 — Supabase real-data-path planning doc (NOT wired into the shell)
Write `docs/superpowers/plans/2026-09-11-supabase-real-data-path.md` (~250-400 lines). This is a planning artifact, not shipped code. Content:
- The decision: demo mode stays the no-backend path (localStorage demo store + demo data). Real persistence + real `deriveTrustContext` come from Supabase when `hasSupabaseEnv()` is true.
- The real data path, component by component, for when `hasSupabaseEnv()` is true:
  - Authentication: `apps/web/lib/supabase/client.js` (`createBrowserClient`) for client components; `apps/web/lib/supabase/server.js` (`createServerClient`) for server reads. No service-role keys. Public publishable key only.
  - Posts: read from `public.posts` (columns: id, space_id, author_id, body, kind, ai_assisted, ai_assistance_type, agent_id, human_approved, created_at). Map to the `createSocialPost`-compatible shape for the existing `PostCard` + `deriveTrustContext`. The `kind` vocabulary is `human | source_linked | ai_assisted` (from the migration check constraint AND social-core `POST_KINDS`).
  - Comments: `public.comments` (post_id, author_id, body, created_at). Join author display name from `public.profiles` (handle, display_name).
  - Claim responses: `public.claim_responses` (post_id, author_id, response_type, body, created_at). `response_type` vocabulary = `support | challenge | qualify | add_evidence | ask_question` (from migration check constraint AND social-core `RESPONSE_TYPES`).
  - Reactions: `public.reactions` (post_id, user_id, reaction, created_at). `reaction` vocabulary = `like | useful | interesting`.
  - Sources: `public.sources` + `public.post_sources` (many-to-many).
  - Provenance: `public.provenance_records` (post_id, source_refs jsonb, transformations jsonb, generated_at).
  - Agent actions + approvals: `public.agent_actions` (agent_id, owner_id, space_id, action, capability, policy_version, approval_status, input_refs, output_refs, created_at) + `public.approval_records` (action_id, approver_id, decision, note, created_at). `approval_status` vocabulary = `not_required | pending | approved | rejected` (from migration check constraint AND action-event.schema.json). This is the data behind the Phase-4 moderator queue + action log.
  - RLS: all runtime tables have RLS enabled. Public-read policies exist on most; owner-scoped write policies on posts/comments/reactions/claim_responses/sources/post_sources/provenance_records. `agent_actions` is owner-read (`auth.uid() = owner_id`); `approval_records` is scoped to the action's owner. This matters for what the real UI can read.
- The `deriveTrustContext` equivalent on real rows: compute `aiAssisted` from `ai_assisted` boolean + `ai_assistance_type`/`agent_id` presence; `humanApproved` from `human_approved`; `sourceCount` from a `post_sources` count join; `disputed`/`challenges`/`qualifications`/`unresolvedQuestions` from a `claim_responses` aggregate grouped by post_id + response_type (challenge→challenges, qualify→qualifications, ask_question→unresolvedQuestions, support→none, add_evidence→evidence count). Be explicit that the aggregate is a read-time computation, not a stored column.
- What changes in the shell when real data is wired: page.js switches from `demoFeed`/`demoAuthors`/`demoStore` to Supabase reads; `PostCard` gets real author profile from `profiles`; `CommentThread` reads/writes `comments`; `ClaimResponseComposer` writes `claim_responses`; `ReactionBar` reads/writes `reactions`; `SourceLinker` reads/writes `sources`+`post_sources`; `CommunityStatePanel` computes from real rows; `ModeratorQueue` reads `agent_actions` with `approval_status = 'pending'`; `ActionLogViewer` reads `agent_actions` + `approval_records` for the space.
- What does NOT change: the design language, the trust-chip vocabulary, the response-type vocabulary, the reaction vocabulary, the approval_status vocabulary, the deny-by-default posture, the no-autonomous-public-posting constraint. These are fixed by the migration + social-core + capability-matrix, not by the UI.
- Security boundary: public publishable key only; no service-role key in the repo; RLS enforces row ownership; the client never sees another user's rows for owner-scoped tables. The planning doc must state this explicitly and must NOT include any real credentials or example keys beyond the empty `.env.example` values.
- Open questions / future work: (a) pagination for the feed (currently chronological, no ranking — fine for alpha); (b) the real `deriveTrustContext` aggregate performance on large feeds; (c) whether claim-response dispute counts should be cached as a materialized view; (d) the moderator queue's real-time refresh (polling vs push). List these as open, not solved.

**Constraints for every file:**
- No new npm packages.
- No secrets anywhere — including the planning doc (no example keys except the empty `.env.example` values, which are already empty).
- Build must stay green: `node --check` on every file + `npm run build:web` clean.
- When editing page.js, make minimal targeted edits (add the two context-note paragraphs, update the read-list) — do not rewrite the whole file.
- The planning doc is markdown; no linter required, but it must be coherent and must not fabricate credentials.

**Output:** a short report listing every file written/modified, line counts, the build result (clean / failure + what failed), and the path to the planning doc.
