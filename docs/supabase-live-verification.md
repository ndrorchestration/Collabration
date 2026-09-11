# Supabase Live Verification Gate

## Status

**NOT VERIFIED · BLOCKED ON ISOLATED INTELLECTRO SUPABASE TARGET**

The repository contains versioned migrations and structural policy tests, but those do not prove live RLS behavior. The currently connected Supabase project belongs to another system and must not receive Intellectro migrations.

This gate is complete only when every required check below passes against a dedicated Intellectro project (or an isolated development branch of a dedicated Intellectro project).

## Required target

- dedicated Intellectro Supabase project;
- no production or unrelated project data;
- publishable browser key only in client runtime configuration;
- privileged/secret credentials kept outside the browser and repository;
- migrations applied in repository order:
  1. `20260911030000_social_vertical_slice.sql`
  2. `20260911034500_persisted_alpha_hardening.sql`.

## Gate A — Schema admission

1. Apply both migrations with the migration API/CLI, not ad hoc manual DDL.
2. Confirm all expected runtime tables exist.
3. Confirm RLS is enabled on every runtime table.
4. Confirm `agent_actions` and `provenance_records` have no ordinary authenticated insert policy.
5. Confirm `create_space_with_owner` is executable by `authenticated` but not `anon`/`public`.
6. Confirm `create_source_linked_post` remains `SECURITY INVOKER`.
7. Run Supabase security advisors; no unresolved RLS/security error may remain.
8. Run performance advisors and record any accepted warnings separately from security blockers.

## Gate B — Authentication/session boundary

Using a real alpha test account through the application:

1. OTP/magic-link initiation reaches `/auth/callback`.
2. PKCE code exchange produces a valid cookie-backed session.
3. `/app` validates identity through claims and loads only after authentication.
4. Session refresh preserves cookies without caching authenticated responses.
5. `/auth/signout` invalidates the browser session and returns to login.
6. A protocol-relative callback target such as `//example.com` cannot redirect off-origin.
7. A second browser/test user never receives the first user's session or content through cache leakage.

## Gate C — Multi-user RLS matrix

Use at minimum:

- **User A** — ordinary member/author;
- **User B** — different ordinary user;
- **Moderator M** — moderator/admin in the tested Space.

Record the authenticated user IDs used for the test in a private execution log; do not commit personal email addresses or credentials.

| Operation | A | B | Moderator M | Required result |
| --- | --- | --- | --- | --- |
| Read authenticated profiles/Spaces | allow | allow | allow | PASS |
| Update A profile as A | allow | — | — | PASS |
| Update A profile as B | — | deny | — | PASS |
| Create Space through RPC as A | allow | — | — | Space + A admin membership atomically created |
| Direct client insert into `spaces` | deny | deny | deny unless a later ADR changes policy | PASS |
| Join Space as self | allow | allow | allow | caller can create only own member row |
| Create post while member | allow | allow if member | allow | PASS |
| Create post while not a member | deny | deny | deny if not member | PASS |
| Forge another `author_id` | deny | deny | deny | PASS |
| Comment/respond while member | allow | allow if member | allow | PASS |
| Comment/respond while non-member | deny | deny | deny if non-member | PASS |
| Add direct source link to own post | allow | — | — | PASS |
| Add direct source link to another user's post | — | deny | deny unless post author | PASS |
| Insert `agent_actions` from browser client | deny | deny | deny | PASS |
| Insert `provenance_records` from browser client | deny | deny | deny | PASS |
| Insert approval as ordinary member | deny | deny | — | PASS |
| Insert approval as moderator for pending action in moderated Space | — | — | allow | PASS |
| Insert approval for action outside moderator's Space | — | — | deny | PASS |

## Gate D — Atomicity and failure behavior

- Duplicate Space slug failure leaves no membership row behind.
- Failed source insertion in `create_source_linked_post` leaves no orphan post/source/link set.
- Removing membership prevents subsequent member-only writes immediately.
- Approval insertion against a non-pending action fails.
- Database denial surfaces as a controlled application error and does not retry with elevated credentials.

## Gate E — Evidence capture

Store non-secret evidence for each verification run:

- project reference (safe identifier only; never secret keys);
- migration versions applied;
- schema/RLS inspection output;
- security/performance advisor results;
- pass/fail matrix with timestamps;
- application commit SHA under test;
- any remediation commit/migration SHA;
- final verdict: `VERIFIED` or `NOT VERIFIED`.

## Fail-closed rule

Until Gates A–E pass, Intellectro may describe the repository persistence boundary as **implemented** but must describe live Supabase/RLS behavior as **NOT VERIFIED**. No real user data, pilot authorization, autonomous agent authority, or production-readiness claim follows from repository CI alone.
