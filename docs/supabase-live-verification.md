# Supabase Live Verification Gate

## Status

**NOT VERIFIED · DATABASE/RLS COMPLETION CANDIDATE PASSED · BROWSER AUTH/SESSION GATE PENDING**

A dedicated Intellectro Supabase project exists and has passed live schema admission, the original multi-user RLS/atomicity matrix, the governed-alpha candidate's targeted social-safety/governed-action/provenance/correction probes, PR #16's connection/profile/block relationship matrix, PR #24's Space-invitation/join-policy authority matrix, and PR #28's performance-only RLS-equivalence verification. The project remains clean of disposable verification data. End-to-end browser authentication/session behavior is still not verified, so the overall live-persistence verdict remains **NOT VERIFIED**.

Current non-secret evidence is recorded in:

- `docs/evidence/supabase-live-verification-2026-09-11.md`;
- `docs/evidence/supabase-space-invitations-live-verification-2026-09-11.md`;
- `docs/evidence/supabase-performance-hardening-live-verification-2026-09-12.md`.

## Required target

- dedicated Intellectro Supabase project;
- no unrelated production data;
- publishable browser key only in client runtime configuration;
- privileged/secret credentials kept outside the browser and repository;
- migrations applied in repository order:
  1. `20260911030000_social_vertical_slice.sql`
  2. `20260911034500_persisted_alpha_hardening.sql`
  3. `20260911043000_function_execute_hardening.sql`
  4. `20260911050000_social_safety_hardening.sql`
  5. `20260911052000_governed_action_lifecycle.sql`
  6. `20260911054000_provenance_receipt_boundary.sql`
  7. `20260911056000_correction_appeal.sql`
  8. `20260911060000_connection_relationships.sql`
  9. `20260911062000_space_invitations.sql`
  10. `20260911064000_performance_hardening.sql`.

## Gate A — Schema / capability admission

**PASS.**

Verified live:

1. All expected runtime tables exist and RLS is enabled where required, including `connection_requests` and `space_invitations`.
2. `agent_actions`, `approval_records`, `provenance_records`, `correction_requests`, and `connection_requests` have no ordinary-browser mutation policy that bypasses their governed/RPC boundary; `connection_requests` exposes participant SELECT only.
3. `space_invitations` exposes participant SELECT only and no ordinary-browser INSERT/UPDATE mutation policy.
4. The former direct authenticated INSERT policy on `blocks` is removed; blocking routes through `block_user(...)` so relationship severance, invitation terminalization, and block creation share the bounded server-side path.
5. The legacy `spaces creator update` policy is absent, so `join_policy` cannot bypass the current-admin RPC through generic creator UPDATE authority.
6. The legacy `memberships self join` policy is absent; open joining routes through `join_open_space(...)`, while invite-only membership is created through accepted invitation finalization.
7. Reaction/report inserts require Space membership.
8. Governed request/decision, provenance, correction, relationship, block, invitation, join-policy, and relationship-visibility helper RPCs are executable by `authenticated` but not by `anon`.
9. The relationship and invitation RPCs derive actor identity from `auth.uid()` and re-check volatile block/policy state where required.
10. Supabase security advisors show no unintended anonymous execution finding.
11. The performance-only hardening cleared all 17 `unindexed_foreign_keys` and all 19 `auth_rls_initplan` findings without changing tested RLS authority behavior.

The security advisor currently reports 16 `authenticated_security_definer_function_executable` warnings across the intentionally exposed narrow RPC surface. Five were added by the Space invitation/join-policy admission (`join_open_space`, `set_space_join_policy`, `invite_to_space`, `decide_space_invitation`, and `revoke_space_invitation`). Independent ACL inspection confirmed `anon_execute=false` and `authenticated_execute=true` for each new boundary, with empty `search_path`. PR #28 introduced no new security-advisor class. The warnings are retained as an explicit review surface rather than suppressed; targeted authorization behavior was exercised independently. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

The performance advisor now reports zero `unindexed_foreign_keys` findings and zero `auth_rls_initplan` findings. It reports 17 `unused_index` INFO findings for the newly created FK indexes immediately after creation on the near-empty alpha database; these remain a later workload-based reassessment item rather than a reason to remove the indexes without representative usage evidence.

## Gate B — Authentication/session boundary

**Browser Gate B: NOT VERIFIED.**

Using real alpha test accounts through the production application:

1. OTP/magic-link initiation reaches `/auth/callback`.
2. PKCE code exchange produces a valid cookie-backed session.
3. `/app` validates identity through claims and loads only after authentication.
4. Session refresh preserves cookies without caching authenticated responses.
5. `/auth/signout` invalidates the browser session and returns to login.
6. A protocol-relative callback target such as `//example.com` cannot redirect off-origin.
7. A second browser/test user never receives the first user's session or content through cache leakage.
8. A database denial surfaces without a privileged retry or identity substitution.

Vercel production and Supabase Auth control-plane prerequisites are tracked in GitHub issue #10.

## Gate C — Multi-user RLS / authority matrix

**PASS at the live database/RLS boundary.**

The original admission used User A, User B, Moderator M, and non-member O synthetic identities. The completion-candidate and relationship admissions used synthetic UUID-only identities with no personal credentials. PR #16's relationship matrix used three users inside a transaction that was rolled back after verification. PR #24's invitation admission used five disposable synthetic identities and two Spaces; all probe records were explicitly purged after verification. PR #28 used disposable authenticated-role transactions to recheck all 19 optimized RLS policies and rolled every probe back.

Current admitted checks include:

| Operation | Required result | Live result |
| --- | --- | --- |
| Member reaction on Space post | allow | PASS |
| Non-member reaction | deny | PASS |
| Member report on Space post | allow | PASS |
| Non-member report | deny | PASS |
| Request approved-list agent capability while member | allow pending record only | PASS |
| Request `grant_capability` / unsupported capability | deny | PASS |
| Ordinary member decides governed action | deny | PASS |
| Moderator decides pending action in own Space | allow | PASS |
| Same action decided twice | deny replay | PASS |
| Moderator decides action in different Space | deny | PASS |
| Moderator records provenance for approved action in same Space | allow | PASS |
| Outsider records approved-action provenance | deny | PASS |
| Member opens correction on Space post | allow | PASS |
| Ordinary member resolves correction | deny | PASS |
| Moderator resolves correction in own Space | allow | PASS |
| Same correction resolved twice | deny replay | PASS |
| Authenticated direct INSERT into `connection_requests` | deny through RLS/no mutation policy | PASS |
| Request connection through bounded RPC | allow for unblocked distinct users | PASS |
| Nonparticipant reads pending relationship | deny | PASS |
| Recipient reads and accepts pending relationship | allow | PASS |
| Bilateral block profile discovery | hide in both directions | PASS |
| Bilateral block relationship-row visibility | hide in both directions | PASS |
| Block accepted relationship | terminal `blocked`; preserve `decided_at`; set `ended_at` | PASS |
| Unblock previously blocked pair | do not resurrect old relationship | PASS |
| Reconnect after unblock | allow new lifecycle | PASS |
| Disconnect accepted relationship | terminal `disconnected`; preserve decision history; set `ended_at` | PASS |
| Accept stale request after intervening block | deny without mutating pending row | PASS |
| Anonymous relationship RPC execution | deny | PASS |
| Join open Space through controlled RPC | allow `member` only | PASS |
| Direct join when Space is invite-only | deny | PASS |
| Non-admin changes Space join policy | deny | PASS |
| Admin changes Space join policy through bounded RPC | allow | PASS |
| Create invitation while Space is open | deny | PASS |
| Non-admin creates invitation | deny | PASS |
| Admin invitation grants role above `member` | impossible / member-only | PASS |
| Non-invitee accepts invitation | deny | PASS |
| Invitee accepts valid pending invitation | create `member` membership | PASS |
| Replayed invitation finalization | deny | PASS |
| Accept invitation after Space policy changed back to open | deny stale acceptance | PASS |
| Admin revokes pending invitation | allow | PASS |
| Bilateral block with pending invitation | terminal `blocked`, no membership | PASS |
| Optimized ownership/self-service RLS policies | preserve owner/self allow and forged/nonowner deny behavior | 38/38 PASS |

The previously admitted baseline also covers profile ownership, atomic Space creation, membership-gated posting/discussion, source-link ownership, browser denial for direct `agent_actions`/`provenance_records`, and database atomicity cases.

## Gate D — Atomicity and failure behavior

**PASS for database-enforced cases tested to date.**

- Duplicate Space slug failure leaves no extra membership row behind.
- Failed source insertion in `create_source_linked_post` leaves no orphan post/source/link set.
- Removing membership prevents subsequent member-only writes immediately.
- Governed actions transition only from pending to one human decision; replay is rejected.
- Cross-Space moderator action is rejected.
- Provenance requires an approved action plus owner/moderator authority and same-Space post binding.
- Correction/appeal requests preserve the original target and only open requests may be resolved by the target Space's moderator.
- Relationship acceptance re-checks block state, so an intervening block defeats stale acceptance.
- Blocking an active/pending relationship is atomic with block creation and records relationship termination without rewriting prior acceptance time.
- Unblocking does not reactivate a terminal `blocked` relationship.
- Disconnect records termination independently from the original acceptance decision.
- Invitation acceptance re-checks current Space policy, invitation state, membership, and bilateral block state before membership creation.
- Invitation finalization is single-use; replay is rejected.
- Invitation acceptance creates only `member` membership.
- Blocking a pending inviter/invitee pair terminalizes that invitation as `blocked`; unblocking does not resurrect it.
- Generic creator Space UPDATE and direct membership self-join paths are absent, so the tested RPC boundaries are not bypassed by those legacy RLS policies.
- PR #28 changes evaluation form only for 19 existing RLS predicates; live paired probes confirm authority semantics remained stable after optimization.
- Application-level denial handling remains part of Gate B/runtime verification.

## Gate E — Evidence capture

**PASS for repository/database admission; runtime evidence remains pending.**

Recorded non-secret evidence includes:

- project reference;
- applied migration ledger, including platform ledger entry `20260911092212 connection_relationships` for repository migration `20260911060000_connection_relationships.sql`;
- applied migration ledger entry `20260912004221 space_invitations` for repository migration `20260911062000_space_invitations.sql`;
- applied migration ledger entry `20260912010210 performance_hardening` for repository migration `20260911064000_performance_hardening.sql`;
- accepted source main SHA `9a474c15ea7cb453e1d7384ed3a772c21c5c815d` for the Space-invitation admission and post-merge CI `34599911307`;
- PR #28 live-admitted implementation head `05568b758b2e1919cc2e4849b1c21bcdb42b7e65` and exact-head CI `34663531165` SUCCESS;
- schema/RLS/ACL inspection;
- security and performance advisor results;
- positive/negative synthetic authority, relationship, invitation, join-policy, replay, block-precedence, and performance-equivalence probes;
- performance advisor deltas: 17 -> 0 unindexed foreign keys; 19 -> 0 auth RLS init-plan findings;
- 38/38 paired RLS-equivalence checks PASS for the 19 rewritten policies;
- cleanup verification showing zero checked synthetic auth users, profiles, Spaces, posts, comments, and sources after the performance probe wave;
- overall fail-closed verdict.

Evidence records:

- `docs/evidence/supabase-live-verification-2026-09-11.md`;
- `docs/evidence/supabase-space-invitations-live-verification-2026-09-11.md`;
- `docs/evidence/supabase-performance-hardening-live-verification-2026-09-12.md`.

## Fail-closed rule

Intellectro may describe the repository persistence boundary as **implemented** and the current live database/RLS layer, including the admitted human relationship/block, controlled Space invitation/join-policy, and performance-hardening boundaries, as **database-verified**. Overall live Supabase persistence remains **NOT VERIFIED** until Browser Gate B passes against a configured production runtime.

Human connection or Space membership state does not grant agent capability or independent governance authority. Performance verification does not expand authority. No real user pilot authorization, autonomous agent authority, production-readiness claim, Product-loop PASS, or Evaluation PASS follows from database verification alone.
