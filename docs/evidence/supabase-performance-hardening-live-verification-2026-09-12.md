# Supabase Performance Hardening Live Verification — 2026-09-12

## Scope and source binding

This record captures live admission and verification of the performance-only Supabase hardening tracked by issue #11 and PR #28.

- repository base before PR #28: `b933fcee304ee4d17f28e73b37895ecc6a66a253`
- repository implementation head admitted live: `05568b758b2e1919cc2e4849b1c21bcdb42b7e65`
- repository migration: `supabase/migrations/20260911064000_performance_hardening.sql`
- dedicated Supabase project: `hibesaapldkvgkydvbds`
- live migration ledger entry: `20260912010210 performance_hardening`
- exact-head CI before live admission: `34663531165` — SUCCESS

This lane changes database performance mechanics only. It does **not** establish Browser Gate B, configured Vercel persistence, production readiness, model execution, human evaluation, or broader agent authority.

## TDD / repository admission

The test-only opening head `d924d1fadac1898063f1ea58665862605bde2191` produced the intended RED state in CI run `34663456621`:

- Node 22: `185/186` tests passed; sole failure was the deliberately absent `20260911064000_performance_hardening.sql`;
- Node 24: same intended failure;
- Next.js production build: PASS.

The implementation head `05568b758b2e1919cc2e4849b1c21bcdb42b7e65` then passed CI run `34663531165` across Node 22, Node 24, governance validation/full tests, and the Next.js production build.

## Advisor baseline and result

Fresh live baseline before the migration:

- `unindexed_foreign_keys`: **17** findings;
- `auth_rls_initplan`: **19** findings.

After live admission:

- `unindexed_foreign_keys`: **0** findings;
- `auth_rls_initplan`: **0** findings.

The migration adds one leading-column index for each of the 17 admitted foreign-key findings and rewrites exactly the 19 affected ownership/self-service policies from row-by-row `auth.uid()` evaluation to `(select auth.uid())` while preserving the same predicates.

The performance advisor immediately reports 17 `unused_index` INFO findings for the newly created indexes. This is expected on the near-empty alpha database immediately after index creation and is a different lint class; it is not treated as evidence that the indexes are unnecessary. Index usefulness should be reassessed only after representative workload data exists.

References:

- https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
- https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
- https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## Security advisor stability

The security advisor remains at **16** `authenticated_security_definer_function_executable` warnings on the previously reviewed authenticated RPC surface. The performance migration introduced no new security-advisor class and made no changes to:

- function security mode;
- function EXECUTE grants;
- authenticated/anonymous role membership;
- capability policy;
- agent authority;
- browser write authority.

Reference: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Structural policy verification

Live `pg_policy` inspection confirmed all 19 targeted policies use init-plan-safe selectors after admission while preserving their original ownership/self-service conditions:

1. `profiles own insert`
2. `profiles own update`
3. `memberships self leave`
4. `posts own update`
5. `posts own delete`
6. `comments own update`
7. `comments own delete`
8. `reactions own delete`
9. `claim responses own delete`
10. `sources own insert`
11. `sources own update`
12. `sources own delete`
13. `post sources own delete`
14. `reports own read`
15. `blocks own read`
16. `blocks own delete`
17. `mutes own read`
18. `mutes own insert`
19. `mutes own delete`

No policy was created or dropped by this migration.

## Live RLS equivalence matrix

Disposable synthetic identities were exercised under the actual `authenticated` database role with transaction rollback. Every rewritten policy received paired positive/negative coverage. Result: **38/38 distinct checks PASS**.

| Policy surface | Positive authority check | Negative/forged authority check | Result |
| --- | --- | --- | --- |
| Profile insert | own identity insert allowed | forged identity insert denied | PASS |
| Profile update | own update allowed | other-user update denied | PASS |
| Membership self-leave | own `member` row deletion allowed | other-user membership deletion denied | PASS |
| Post update | author update allowed | other-user update denied | PASS |
| Post delete | author delete allowed | other-user delete denied | PASS |
| Comment update | author update allowed | other-user update denied | PASS |
| Comment delete | author delete allowed | other-user delete denied | PASS |
| Reaction delete | owner delete allowed | other-user delete denied | PASS |
| Claim-response delete | author delete allowed | other-user delete denied | PASS |
| Source insert | own `created_by` insert allowed | forged creator insert denied | PASS |
| Source update | creator update allowed | other-user update denied | PASS |
| Source delete | creator delete allowed | other-user delete denied | PASS |
| Post-source delete | `added_by` owner delete allowed | other-user delete denied | PASS |
| Report read | reporter read allowed | other-user read denied | PASS |
| Block read | blocker read allowed | blocked user read denied | PASS |
| Block delete | blocker delete allowed | blocked user delete denied | PASS |
| Mute read | muter read allowed | muted user read denied | PASS |
| Mute insert | own muter identity insert allowed | forged muter insert denied | PASS |
| Mute delete | muter delete allowed | muted user delete denied | PASS |

The live probes therefore verify behavior, rather than inferring semantic equivalence from SQL text alone.

## Cleanup verification

All synthetic probe writes were wrapped in transactions and rolled back. Explicit residue inspection returned zero for the checked synthetic identities and objects:

- `auth_users = 0`
- `profiles = 0`
- `spaces = 0`
- `posts = 0`
- `comments = 0`
- `sources = 0`

No real user credentials or personal content were used.

## Verdict

**Supabase performance-hardening live admission: PASS.**

The two targeted advisor classes are cleared, and all 19 rewritten RLS policies retain the tested owner/self-service allow and forged/nonowner deny behavior.

Still fail-closed and outside this lane:

- Browser Gate B: **NOT VERIFIED**;
- production Vercel persistence: **NOT VERIFIED**;
- `main` protection: **NOT VERIFIED / not enforced at the last repository check**;
- real provider-backed model execution: **NOT VERIFIED**;
- human Contextual Trust Comprehension evaluation: **NOT VERIFIED**;
- Alpha Complete: **NO**.