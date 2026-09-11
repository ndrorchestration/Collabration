# Social Vertical Slice Threat Model

## Scope

This threat model covers the Intellectro social vertical slice and persisted-alpha boundary: profiles/membership, chronological posts and comments, source-linked claims, contextual responses, trust/context disclosure, Supabase SSR authentication/persistence wiring, RLS policy design, governed pending-action/provenance records, correction/appeal records, and bounded Community/Claim agents.

It does **not** authorize autonomous public posting, policy mutation by agents, algorithmic ranking, federation, an agent marketplace, or admission of real user data merely because repository controls exist. Production/runtime readiness remains separately gated by live configuration and browser evidence.

## Protected properties

1. **Human attribution** — users can tell who authored the underlying social object.
2. **Agent accountability** — every agent resolves to an accountable owner and typed capability.
3. **Approval integrity** — approval-required output cannot silently become public.
4. **Provenance integrity** — source/transformation records cannot be presented as proof of truth.
5. **Community agency** — contextual challenge and moderation remain reversible and human-governed.
6. **Data isolation** — users cannot mutate other users' content through ordinary client credentials.
7. **Ranking legibility** — the alpha feed remains chronological and cannot silently optimize engagement.
8. **Session isolation** — authenticated SSR responses cannot leak one user's session into another request/cache path.
9. **Correction integrity** — correction/appeal history is appended without silently rewriting the original post or governed action.

## Threats and controls

### T1 — Agent output masquerades as human-authored content

**Failure:** an automated draft is displayed without disclosing the agent or approval state.

**Controls:** typed AI-assistance fields; visible trust chips; accountable agent/action records; human approval state; no autonomous public-post capability in the alpha policy. Repository request/approval records do not themselves execute a model or publish output.

### T2 — Provenance badge becomes a truth badge

**Failure:** users interpret “source-linked” or a provenance receipt as “verified true.”

**Controls:** UI language states that provenance records origin/transformation, not truth; support/challenge/qualify remain open; provenance code and the approved-action receipt boundary synthesize no `truth`, `verified`, or confidence field.

### T3 — RLS bypass permits cross-user or cross-Space mutation

**Failure:** a client writes content on behalf of another user or posts into a Space they have not joined.

**Controls:** RLS on every runtime table; server actions derive actor identity from validated claims; post/comment/context-response policies bind identity to `auth.uid()` and require Space membership; direct source-link mutation is restricted to the post author; governed audit/provenance tables retain no general ordinary-client INSERT policy.

**Evidence state:** the dedicated Supabase project's earlier live multi-user DB/RLS matrix passed and was cleaned afterward. The completion-branch migrations for social-safety hardening, governed-action lifecycle, provenance receipts, and correction/appeal are **NOT VERIFIED live yet** and must be admitted and re-tested before the runtime/security gate can pass.

### T4 — Approval spoofing or replay

**Failure:** an agent approves itself, an ordinary member approves an action, a client fabricates an approval for another human, or a finalized decision is replayed.

**Controls:** governance kernel rejects self-escalation; the capability matrix is deny-by-default; `request_governed_agent_action` derives ownership from `auth.uid()` and accepts only explicit approval-required alpha agent/capability pairs; `decide_governed_agent_action` requires moderator authority in the target Space, locks the pending row, records the human decision, and rejects finalized/replayed actions. There is no direct ordinary-client approval INSERT path.

**Residual boundary:** these repository controls create and decide governance records only. Real model execution, artifact publication, and the full persisted product loop remain separate runtime/product-loop gates.

### T5 — Challenge mechanics become harassment or reputation attacks

**Failure:** “Challenge” is used as a social downvote rather than an evidence/context interaction.

**Controls:** challenge/qualify are typed contextual actions, coexist with ordinary reactions, and do not alter feed rank. Report, mute, and block paths are available without silently mutating another person's content. Real multi-account abuse testing remains a live alpha evidence gate.

### T6 — Hidden engagement ranking appears in the feed

**Failure:** implementation introduces relevance or engagement sorting while UI still claims user control.

**Controls:** `chronologicalFeed` has tests; UI explicitly says “Chronological feed / No ranking model”; persisted query orders by creation time; no ranking dependency exists in the alpha slice.

### T7 — Demo state is mistaken for live persistence or authentication

**Failure:** a user believes demo identities/interactions are persisted or believes persistence is verified merely because runtime code exists.

**Controls:** missing Supabase configuration fails closed; `/app` reports the persistence boundary; login remains disabled without public configuration; `/api/health` exposes configuration state without secrets; documentation separates repository, database, browser-session, product-loop, operations, and evaluation predicates.

### T8 — Public Supabase configuration is confused with privileged credentials

**Failure:** service-role/secret keys are exposed to the browser or repository.

**Controls:** only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are referenced by the browser application; `.env.example` contains no values; `SECURITY.md` forbids production credentials and service-role secrets. Governed database RPCs derive identity from `auth.uid()` rather than accepting privileged browser identity fields.

### T9 — Community or Claim Agent becomes invisible authority

**Failure:** automated flags, summaries, annotations, or drafts silently delete, ban, publish, alter policy, or expand capability.

**Controls:** canonical policy denies delete/ban/change-policy/grant-capability/self-escalation; public draft/annotation capabilities remain approval-required; the browser has no direct `agent_actions` INSERT policy; the narrow request RPC permits only explicit approval-required alpha pairs and creates a pending review record rather than executing or publishing anything.

### T10 — Repository schema is treated as production-safe without live admission testing

**Failure:** structural migration tests are mistaken for proof that the current completion candidate behaves correctly in the live Supabase/runtime environment.

**Controls:** the earlier dedicated-project DB/RLS baseline is recorded separately from current candidate admission. Every new completion migration must be applied in order to the dedicated Intellectro project, security advisors re-run, and targeted positive/negative live probes repeated before current-candidate live database behavior is promoted. Browser auth/session Gate B remains **NOT VERIFIED** until exercised against configured production.

### T11 — SSR session/callback leakage or redirect abuse

**Failure:** stale sessions are trusted, refresh cookies are cached across users, or auth callback parameters can redirect outside Intellectro.

**Controls:** request-scoped server clients; authorization via `auth.getClaims()`; Supabase refresh cookies and cache headers are propagated; authenticated proxy responses use `Cache-Control: private, no-store`; PKCE callback exchanges server-side codes; callback `next` accepts only single-slash local paths and rejects protocol-relative redirects.

**Evidence state:** structurally covered in repository tests. Real browser initiation, callback, refresh, sign-out, second-user isolation, and cache/session behavior remain **NOT VERIFIED** until Gate B runs on configured production.

### T12 — Correction or appeal becomes silent history rewriting

**Failure:** a correction request edits the original post/action, a non-moderator resolves a request, or a resolved request is replayed.

**Controls:** `correction_requests` targets exactly one post or governed action; requester identity comes from `auth.uid()`; resolution is moderator-scoped to the target Space; the row is locked and only open requests can transition; the correction path updates only its own request ledger and never rewrites original post/action content. The UI states that original records remain unchanged.

## Residual risk / next required evidence

Before the alpha can be called complete:

- apply the completion-branch migrations to the dedicated Intellectro Supabase project in canonical order;
- re-run Supabase security advisors and targeted live positive/negative probes for reactions/reports, governed request/decision replay, provenance receipt authority, and correction/appeal authority;
- configure the Vercel public Supabase environment and Supabase Auth Site URL/redirect allow-list;
- verify real browser sign-in, callback, refresh, sign-out, unsafe-redirect rejection, and second-user session/cache isolation (**Gate B remains NOT VERIFIED until then**);
- exercise the persisted product loop without a privileged browser bypass;
- keep real model-provider execution fail-closed until a server-only provider path is explicitly configured and separately tested;
- abuse-test challenge/report/block/mute paths with realistic multi-account behavior;
- review rate limits using realistic multi-account behavior;
- establish mainline required-check protection if supported, otherwise retain the missing control as an explicit operations blocker;
- verify runtime evidence capture, rollback/recovery expectations, logging, secret management, and incident response;
- run the Contextual Trust Comprehension human evaluation before promoting the Evaluation predicate.
