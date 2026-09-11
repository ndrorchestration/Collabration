# Supabase Live Verification Evidence — 2026-09-11

## Target

- Project: `hibesaapldkvgkydvbds`
- Region: `us-east-2`
- Dedicated Intellectro project: yes
- Source application commit at admission start: `f5e7cfd4d110d640790db0c4c6fb6782bf9ac8b7`
- Live-verification verdict at this record: **NOT VERIFIED** until browser authentication/session Gate B is completed.

No personal email addresses, credentials, secret keys, or service-role credentials are recorded here.

## Applied migrations

Repository order:

1. `20260911030000_social_vertical_slice.sql`
2. `20260911034500_persisted_alpha_hardening.sql`
3. `20260911043000_function_execute_hardening.sql`

Supabase migration ledger versions assigned by the platform:

- `20260911041848` — `social_vertical_slice`
- `20260911041906` — `persisted_alpha_hardening`
- `20260911042225` — `function_execute_hardening`

## Gate A — Schema admission

**PASS with one intentional advisor warning recorded.**

Verified live:

- 15 expected public runtime tables exist.
- RLS is enabled on every runtime table.
- `agent_actions` has no authenticated/client INSERT policy.
- `provenance_records` has no authenticated/client INSERT policy.
- `create_source_linked_post` is `SECURITY INVOKER`.
- `create_space_with_owner` is `SECURITY DEFINER` and is executable by `authenticated` but not `anon`.
- `is_space_member` and `is_space_moderator` are not executable by `anon`.

### Live defect found and remediated

Initial admission showed direct Supabase `anon` EXECUTE grants on the governed functions even though the earlier migration revoked from `PUBLIC`. The live ACL contained direct grants such as `anon=X/postgres`, so `REVOKE ... FROM PUBLIC` did not remove anonymous API execution.

Remediation:

- regression test added in `tests/supabase-function-acl.test.js`;
- migration `20260911043000_function_execute_hardening.sql` explicitly revokes EXECUTE from `anon`;
- exact remediation head `2868e0bac22e3cd0f3811526a61fc4f9e11f85f6` passed Node 22, Node 24, governance validation, full tests, and production build before live application;
- live recheck confirmed `anon_execute=false` and `authenticated_execute=true` on all four governed functions.

### Security advisor

After remediation, the anonymous `SECURITY DEFINER` warning disappeared.

One warning remains intentionally accepted: signed-in users can execute `create_space_with_owner`. This is the designed authenticated privilege boundary used to atomically create a Space and its initial admin membership; the function derives identity from `auth.uid()` and has an empty `search_path`.

Reference: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Gate C — Multi-user RLS matrix

**PASS at the database/RLS boundary.**

The live probe used synthetic UUID-only identities for User A, User B, Moderator M, and non-member O. No personal credentials or emails were used. Probe data was deleted immediately after verification.

Passed checks:

- authenticated profile/Space reads;
- A updates A profile;
- B cannot update A profile;
- A creates a Space through `create_space_with_owner` and receives atomic admin membership;
- direct client Space inserts denied for A, B, and M;
- B and M can self-join only as members;
- member post creation allowed for A, B, and M;
- non-member post creation denied;
- forged `author_id` denied;
- member comment and contextual response allowed;
- non-member comment and contextual response denied;
- author can add a direct source link to own post;
- another user cannot add a direct source link to that post;
- browser-role inserts into `agent_actions` denied for A, B, and M;
- browser-role inserts into `provenance_records` denied for A, B, and M;
- ordinary member approval denied;
- moderator approval allowed for a pending action in the moderated Space;
- moderator approval denied outside the moderated Space.

## Gate D — Atomicity and failure behavior

**PASS for database-enforced cases.**

Verified live:

- duplicate Space slug failure leaves the existing membership cardinality unchanged;
- failed source insertion in `create_source_linked_post` leaves no orphan post;
- removing membership immediately blocks subsequent member-only writes;
- approval against a non-pending action is denied.

The application-level requirement that a database denial surfaces as a controlled application error without privileged retry remains coupled to Gate B/runtime verification.

## Performance advisor

Recorded as non-blocking alpha optimization debt, not as security blockers:

- 17 unindexed foreign-key findings;
- 24 RLS init-plan efficiency findings recommending `(select auth.uid())` form;
- 4 unused-index findings expected on an empty project.

References:

- https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
- https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
- https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## Cleanup verification

After the RLS probe:

- `auth.users`: 0
- `profiles`: 0
- `spaces`: 0
- `posts`: 0
- `agent_actions`: 0
- `approval_records`: 0

The project remains empty and contains no real user data.

## Remaining gate

Gate B — real browser authentication/session behavior — remains **NOT VERIFIED** until the dedicated project URL and publishable key are configured in the Vercel runtime and the OTP/PKCE/session/sign-out/cache-isolation matrix is exercised end to end.
