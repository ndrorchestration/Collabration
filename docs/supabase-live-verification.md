# Supabase Live Verification Gate

## Status

**NOT VERIFIED · DATABASE/RLS COMPLETION CANDIDATE PASSED · BROWSER AUTH/SESSION GATE PENDING**

A dedicated Intellectro Supabase project exists and has passed live schema admission, the original multi-user RLS/atomicity matrix, and the alpha-completion candidate's targeted social-safety, governed-action, provenance, and correction/appeal probes. The project remains clean of the disposable verification data. End-to-end browser authentication/session behavior is still not verified, so the overall live-persistence verdict remains **NOT VERIFIED**.

Current non-secret evidence is recorded in `docs/evidence/supabase-live-verification-2026-09-11.md`.

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
  7. `20260911056000_correction_appeal.sql`.

## Gate A — Schema / capability admission

**PASS.**

Verified live:

1. All expected runtime tables exist and RLS is enabled where required.
2. `agent_actions`, `approval_records`, `provenance_records`, and `correction_requests` have no ordinary browser write policy that bypasses their governed RPC boundary.
3. Reaction/report inserts require Space membership.
4. Governed request/decision, provenance, and correction RPCs are executable by `authenticated` but not by `anon`.
5. Each exposed `SECURITY DEFINER` boundary derives actor identity from `auth.uid()` and performs the relevant membership/owner/moderator check internally.
6. Supabase security advisors show no unintended anonymous execution finding.
7. Performance-advisor findings are tracked separately as optimization debt rather than security-completion evidence.

The security advisor currently reports six intentional `authenticated_security_definer_function_executable` warnings. They correspond to narrow authenticated RPC boundaries whose live authorization behavior was independently exercised; they are not being treated as proof of safety merely because they exist.

## Gate B — Authentication/session boundary

**NOT VERIFIED.**

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

The original admission used User A, User B, Moderator M, and non-member O synthetic identities. The completion-candidate admission repeated targeted authority checks with synthetic UUID-only identities and no personal credentials.

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
- Application-level denial handling remains part of Gate B/runtime verification.

## Gate E — Evidence capture

**PASS for repository/database admission; runtime evidence remains pending.**

Recorded non-secret evidence includes:

- project reference;
- applied migration ledger;
- schema/RLS/ACL inspection;
- security/performance advisor results;
- positive/negative synthetic authority probes;
- repository candidate SHA and CI run;
- cleanup verification;
- overall fail-closed verdict.

Current evidence: `docs/evidence/supabase-live-verification-2026-09-11.md`.

## Fail-closed rule

Intellectro may describe the repository persistence boundary as **implemented** and the current live database/RLS layer as **database-verified**. Overall live Supabase persistence remains **NOT VERIFIED** until browser Gate B passes against a configured production runtime.

No real user pilot authorization, autonomous agent authority, production-readiness claim, Product-loop PASS, or Evaluation PASS follows from database verification alone.