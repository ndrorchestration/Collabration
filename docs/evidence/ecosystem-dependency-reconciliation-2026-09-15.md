# Ecosystem dependency reconciliation — 2026-09-15

## Verdict

**DATABASE/RLS STATE VERIFIED · PRODUCTION PERSISTENCE NOT CONFIGURED · OVERALL LIVE PERSISTENCE NOT VERIFIED**

This record binds Intellectro's dependency and provider state to directly observed GitHub, Supabase, and Vercel evidence on 2026-09-15. It does not widen authorization, production-readiness, or autonomous-agent claims.

## Dependency admission rule

An available connector is not a dependency. Admission requires an owner, provider resource ID, source declaration, lockfile, migration custody when applicable, deployment/environment binding, credential class, authorization controls, verification gate, failure behavior, and rollback path.

## GitHub / package custody

- Repository owner: `ndrorchestration/Intellectro`.
- Canonical application/database migrations are repository-custodied under `supabase/`.
- `package-lock.json` is committed and the documented install path uses `npm ci`.
- `package.json` constrains Node to `>=22` but does not currently pin a package-manager version.
- Vercel currently reports Node `24.x` for the Intellectro project. That is compatible with the repository's lower bound, but it is not an exact runtime pin.
- A future supply-chain hardening ticket should explicitly pin the package manager/runtime policy and keep frozen-lockfile installation as a visible CI/deployment gate.

## Supabase project binding

Dedicated project reference: `hibesaapldkvgkydvbds`.

Observed live on 2026-09-15:

- project status `ACTIVE_HEALTHY`;
- 18 public runtime tables;
- RLS enabled on all 18 public tables;
- 10 applied Supabase migration-ledger entries, corresponding to the ten repository-custodied migrations through `performance_hardening`;
- one current security-advisor warning class, `authenticated_security_definer_function_executable`, with 16 findings.

The 16 findings identify the intentionally exposed authenticated SECURITY DEFINER RPC surface. They are **warnings, not automatically vulnerabilities**. Existing repository/live evidence already covers many positive and negative authority flows. However, that evidence is not equivalent to a complete per-function negative matrix.

### Remaining privileged-RPC verification

For each of the 16 exposed SECURITY DEFINER functions, retain or add explicit negative cases for every applicable dimension:

1. wrong caller / unauthenticated caller;
2. wrong object or non-participant object;
3. cross-Space or cross-owner authority attempt;
4. stale, replayed, or otherwise invalid lifecycle transition.

Do not close the advisor review surface merely because the functions use bounded roles, `auth.uid()`, fixed/empty `search_path`, or fail-closed exception paths. Those implementation properties are supporting evidence; behavior still requires the function-specific negative matrix.

## Vercel runtime state

Vercel project `intellectro` is linked to GitHub repository `ndrorchestration/Intellectro`.

The current production deployment observed on 2026-09-15 is `READY` and bound to `main` commit `8cac9a583e0d9a22e145f8af494ac3c8ccecb484`.

The production health endpoint reports:

- `environment: production`;
- `runtimeMode: misconfigured`;
- `persistence: disabled`;
- `configurationReason: production_persistence_missing`.

Therefore the earlier open question "is production bound to the correct Supabase project?" currently resolves fail-closed as **NO CONFIGURED PRODUCTION PERSISTENCE BINDING IS PRESENT**. This is stronger and more precise than merely saying the binding is unproven. No secret value was read or recorded to reach this conclusion.

Production browser Gate B remains **NOT VERIFIED** and cannot pass while required persistence configuration is absent.

## Migration reconciliation

Live Supabase ledger entries observed, in order:

1. `20260911041848 social_vertical_slice`
2. `20260911041906 persisted_alpha_hardening`
3. `20260911042225 function_execute_hardening`
4. `20260911053355 social_safety_hardening`
5. `20260911053412 governed_action_lifecycle`
6. `20260911053424 provenance_receipt_boundary`
7. `20260911053449 correction_appeal`
8. `20260911092212 connection_relationships`
9. `20260912004221 space_invitations`
10. `20260912010210 performance_hardening`

The platform-assigned migration versions differ from repository filename timestamps for several migrations. Reconciliation is therefore by ordered migration identity/name plus retained admission evidence, not by assuming version-number equality.

## Credential boundary

No privileged key material was requested, printed, or copied into this record. Remaining credential QA is structural:

- confirm browser configuration uses only publishable/public key class;
- confirm service-role/secret material is absent from public bundles and repository history;
- name rotation ownership and response procedure;
- preserve server-only handling for any future privileged provider credential.

## Next actions

1. Complete the 16-function privileged-RPC negative authorization matrix.
2. Configure production persistence only through an explicit deployment change; then verify the runtime targets project `hibesaapldkvgkydvbds` without exposing credentials.
3. Re-run production browser Gate B after binding is present.
4. Add explicit package-manager/runtime pinning and frozen-lockfile enforcement evidence where missing.
5. Complete credential-class, rotation-ownership, and public-bundle review.

## Authority boundary

- GitHub owns source, migrations, lockfiles, CI, and repository evidence.
- Supabase owns live database/Auth/RLS/function/advisor facts.
- Vercel owns deployment identity, environment configuration, and runtime facts.
- No provider's healthy state transfers verification or authorization to another layer.
