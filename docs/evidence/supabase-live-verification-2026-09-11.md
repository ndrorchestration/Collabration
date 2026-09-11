# Supabase Live Verification Evidence — 2026-09-11

## Target

- Project: `hibesaapldkvgkydvbds`
- Region: `us-east-2`
- Dedicated Intellectro project: yes
- Original database-admission application commit: `f5e7cfd4d110d640790db0c4c6fb6782bf9ac8b7`
- Alpha-completion repository candidate before evidence-doc update: `3e742fac48563fabcd4b017546a2c689a3a8931d`
- Candidate CI run: `34566383855` — completed success
- Live-verification verdict at this record: **NOT VERIFIED** until browser authentication/session Gate B is completed.

No personal email addresses, credentials, secret keys, or service-role credentials are recorded here.

## Applied migrations

Repository order:

1. `20260911030000_social_vertical_slice.sql`
2. `20260911034500_persisted_alpha_hardening.sql`
3. `20260911043000_function_execute_hardening.sql`
4. `20260911050000_social_safety_hardening.sql`
5. `20260911052000_governed_action_lifecycle.sql`
6. `20260911054000_provenance_receipt_boundary.sql`
7. `20260911056000_correction_appeal.sql`

Supabase migration ledger versions assigned by the platform:

- `20260911041848` — `social_vertical_slice`
- `20260911041906` — `persisted_alpha_hardening`
- `20260911042225` — `function_execute_hardening`
- `20260911053355` — `social_safety_hardening`
- `20260911053412` — `governed_action_lifecycle`
- `20260911053424` — `provenance_receipt_boundary`
- `20260911053449` — `correction_appeal`

## Gate A — Schema / capability admission

**PASS at the live database boundary.**

Verified live after the alpha-completion migrations:

- `correction_requests` exists with RLS enabled.
- `agent_actions`, `approval_records`, `provenance_records`, and `correction_requests` expose governed/read policies but no ordinary browser INSERT path that bypasses the RPC boundaries.
- reactions and reports are membership-gated for INSERT.
- `create_space_with_owner`, `request_governed_agent_action`, `decide_governed_agent_action`, `record_approved_action_provenance`, `request_correction_or_appeal`, and `resolve_correction_or_appeal` all report `anon_execute=false` and `authenticated_execute=true`.
- the six authenticated `SECURITY DEFINER` functions expose ACLs only to `postgres`, `authenticated`, and `service_role`; no direct `anon` grant remains.
- the governed-action request RPC accepts only the explicit approval-required alpha capability pairs.
- provenance receipt creation requires an already-approved governed action and owner-or-moderator authority.
- correction/appeal request and resolution authority is derived from `auth.uid()` and target-Space membership/moderation.

### Security advisor

The security advisor reports six `authenticated_security_definer_function_executable` warnings for intentionally exposed authenticated privilege boundaries:

- `create_space_with_owner`
- `request_governed_agent_action`
- `decide_governed_agent_action`
- `record_approved_action_provenance`
- `request_correction_or_appeal`
- `resolve_correction_or_appeal`

These warnings are intentionally accepted for the alpha candidate because each function:

- is inaccessible to `anon`;
- derives the acting identity from `auth.uid()`;
- uses an empty `search_path`;
- enforces the required membership/owner/moderator checks internally;
- is narrower than granting equivalent direct table mutation authority to ordinary browser clients.

Reference: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Gate C — Multi-user RLS / governed-action matrix

**PASS at the live database/RLS boundary.**

The completion-candidate probe used four synthetic UUID-only identities:

- **User A** — Space creator / author;
- **User B** — ordinary member;
- **Moderator M** — moderator in Space A only;
- **Outsider O** — non-member.

No personal credentials or email addresses were used.

### Social-safety checks

Passed live:

- User B, as a member, can insert an allowed reaction on a Space-A post.
- User B, as a member, can submit a report on a Space-A post.
- Outsider O cannot insert a reaction on the same post; RLS rejects it.
- Outsider O cannot submit a report on the same post; RLS rejects it.

### Governed action checks

Passed live:

- User B can request `claim_agent / draft_annotation` in a Space where B is a member.
- ordinary User B cannot approve the pending governed action (`moderator authority required`).
- a malformed/self-expanding `claim_agent / grant_capability` request is rejected (`capability is not approval-required for this alpha agent`).
- Moderator M can approve the pending action in Space A.
- a second decision on the finalized action is rejected (`action is already finalized`).
- User B can create a separate pending Community Agent action in Space B.
- Moderator M, who is not a moderator in Space B, cannot approve that action (`moderator authority required`).

### Provenance checks

Passed live:

- Moderator M can create an approved-action provenance receipt tied to the approved Space-A action and a post in the same Space.
- Outsider O cannot create a receipt for that action (`owner or Space moderator required`).
- the browser still has no generic direct INSERT policy for `provenance_records`.

### Correction / appeal checks

Passed live:

- User B can open a correction request against a post in a Space where B is a member.
- User B cannot resolve the correction (`Space moderator required`).
- Moderator M can resolve the open request.
- a second resolution is rejected (`correction request is not open`).
- the correction path does not rewrite the original post/action record.

## Gate D — Atomicity and failure behavior

**PASS for database-enforced cases tested to date.**

Verified across the original and completion-candidate admission passes:

- duplicate Space slug failure leaves membership cardinality unchanged;
- failed source insertion in `create_source_linked_post` leaves no orphan post;
- removing membership immediately blocks subsequent member-only writes;
- non-pending governed action decisions fail;
- action finalization replay fails;
- cross-Space moderator finalization fails;
- correction resolution replay fails;
- outsider provenance creation fails;
- ordinary browser roles cannot bypass governed action/provenance/correction authority with direct table policies.

The application-level requirement that a database denial surfaces as a controlled application error without privileged retry remains coupled to Gate B/runtime verification.

## Performance advisor

Latest advisor findings are recorded as non-blocking alpha optimization debt, not as security blockers:

- 17 unindexed foreign-key findings;
- 22 RLS init-plan efficiency findings recommending `(select auth.uid())` form for older policies.

References:

- https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
- https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan

These findings should be handled separately from the correctness/security completion gate so optimization changes do not silently alter the admitted authority model.

## Cleanup verification

After the completion-candidate probe:

- synthetic `auth.users`: 0
- probe Spaces: 0
- probe posts: 0
- probe correction requests: 0
- probe provenance receipts: 0

The dedicated project is clean of the disposable probe identities and content. No real user data was introduced by this verification.

## Remaining gates

Database/RLS admission for the completion candidate is **PASS**. Overall live Supabase persistence remains **NOT VERIFIED** because Gate B has not run against a configured production browser runtime.

External/runtime requirements are tracked in GitHub issue #10 and include:

- Vercel production public Supabase environment configuration;
- Supabase Auth Site URL / redirect allow-list;
- real OTP/PKCE/session/refresh/sign-out/second-user browser matrix;
- persisted product-loop execution without privileged browser bypass;
- mainline required-check protection;
- human Contextual Trust Comprehension evaluation.
