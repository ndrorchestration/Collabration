# Social Vertical Slice Threat Model

## Scope

This threat model covers the Intellectro social vertical slice and persisted-alpha boundary: profiles/membership, chronological posts and comments, source-linked claims, contextual responses, trust/context disclosure, Supabase SSR authentication/persistence wiring, RLS policy design, and bounded Community/Claim agents.

It does **not** authorize autonomous public posting, policy mutation by agents, algorithmic ranking, federation, an agent marketplace, production deployment, or admission of real user data before the live Supabase verification gate passes.

## Protected properties

1. **Human attribution** — users can tell who authored the underlying social object.
2. **Agent accountability** — every agent resolves to an accountable owner and typed capability.
3. **Approval integrity** — approval-required output cannot silently become public.
4. **Provenance integrity** — source/transformation records cannot be presented as proof of truth.
5. **Community agency** — contextual challenge and moderation remain reversible and human-governed.
6. **Data isolation** — users cannot mutate other users' content through ordinary client credentials.
7. **Ranking legibility** — the alpha feed remains chronological and cannot silently optimize engagement.
8. **Session isolation** — authenticated SSR responses cannot leak one user's session into another request/cache path.

## Threats and controls

### T1 — Agent output masquerades as human-authored content

**Failure:** an automated draft is displayed without disclosing the agent or approval state.

**Controls:** typed AI-assistance fields; visible trust chips; agent owner/action event; human approval state; no autonomous public-post capability in the alpha policy.

### T2 — Provenance badge becomes a truth badge

**Failure:** users interpret “source-linked” as “verified true.”

**Controls:** UI language states that provenance records origin/transformation, not truth; support/challenge/qualify remain open; no `truth` or `verified` field is synthesized by provenance code.

### T3 — RLS bypass permits cross-user or cross-Space mutation

**Failure:** a client writes content on behalf of another user or posts into a Space they have not joined.

**Controls:** RLS on every runtime table; server actions derive actor identity from validated claims; post/comment/context-response policies bind identity to `auth.uid()` and require Space membership; direct source-link mutation is restricted to the post author; governed agent/provenance tables still have no ordinary client insert policy.

**Evidence state:** structurally tested in-repository; live multi-user Supabase behavior remains **NOT VERIFIED**.

### T4 — Approval spoofing

**Failure:** an agent approves itself, an ordinary member approves an action, or a client fabricates an approval for another human.

**Controls:** governance kernel rejects agent self-escalation; Claim Agent accepts only human approval metadata; server actions derive approver identity from validated claims; approval insertion requires a pending action in a Space where `auth.uid()` is moderator/admin.

**Residual boundary:** the trusted server path that creates `agent_actions` is intentionally not implemented yet, so end-to-end approval execution remains pending.

### T5 — Challenge mechanics become harassment or reputation attacks

**Failure:** “Challenge” is used as a social downvote rather than an evidence/context interaction.

**Controls:** challenge/qualify are typed contextual actions, coexist with ordinary reactions, and do not alter feed rank. Abuse testing and richer persisted challenge requirements remain an alpha-study gate.

### T6 — Hidden engagement ranking appears in the feed

**Failure:** implementation introduces relevance or engagement sorting while UI still claims user control.

**Controls:** `chronologicalFeed` has tests; UI explicitly says “Chronological feed / No ranking model”; persisted query orders by creation time; no ranking dependency exists in the alpha slice.

### T7 — Demo state is mistaken for live persistence or authentication

**Failure:** a user believes demo identities/interactions are persisted or believes persistence is verified merely because the runtime code exists.

**Controls:** missing Supabase configuration fails closed; `/app` explicitly reports that persistence is disabled; login remains disabled without public configuration; documentation distinguishes repository implementation from live-database verification.

### T8 — Public Supabase configuration is confused with privileged credentials

**Failure:** service-role/secret keys are exposed to the browser or repository.

**Controls:** only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are referenced by the browser application; `.env.example` contains no values; `SECURITY.md` forbids production credentials and service-role secrets.

### T9 — Community Agent becomes an invisible moderator authority

**Failure:** automated flags or summaries silently delete, ban, publish, or alter policy.

**Controls:** permission tests deny publish/delete/ban/change-policy; Community Agent only plans actions; no ordinary client path can create governed `agent_actions`; human moderator remains the escalation boundary.

### T10 — Schema exists but is treated as production-safe without integration testing

**Failure:** structural migration checks are mistaken for proof that RLS behaves correctly in a live Supabase project.

**Controls:** documentation marks live RLS **NOT VERIFIED** until migrations are applied to an isolated Intellectro project and the positive/negative matrix in `supabase-live-verification.md` passes.

### T11 — SSR session/callback leakage or redirect abuse

**Failure:** stale sessions are trusted, refresh cookies are cached across users, or auth callback parameters can redirect outside Intellectro.

**Controls:** request-scoped server clients; authorization via `auth.getClaims()`; Supabase refresh cookies and cache headers are propagated; authenticated proxy responses use `Cache-Control: private, no-store`; PKCE callback exchanges server-side codes; callback `next` accepts only single-slash local paths and rejects protocol-relative redirects.

## Residual risk / next required evidence

Before a live alpha with user data:

- create an isolated Intellectro Supabase project;
- apply both migrations in order and review Supabase security/performance advisors;
- verify SSR sign-in, callback, refresh, sign-out, and session isolation against the live project;
- run positive/negative RLS tests with at least two ordinary users plus one moderator/admin identity;
- verify atomic Space creation cannot leave orphan membership state;
- verify cross-user and non-member writes fail at the database boundary;
- implement and test the trusted server writer for agent action/provenance records;
- add moderator review queue and appeal/correction workflow;
- abuse-test challenge/report/block/mute paths;
- review rate limits using realistic multi-account behavior;
- verify backups, logging, secret management, and incident response.
