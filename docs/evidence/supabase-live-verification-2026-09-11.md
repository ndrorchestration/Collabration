# Supabase Live Verification Evidence — 2026-09-11

## Target

- Project: `hibesaapldkvgkydvbds`
- Region: `us-east-2`
- Dedicated Intellectro project: yes
- Original database-admission application commit: `f5e7cfd4d110d640790db0c4c6fb6782bf9ac8b7`
- Alpha-completion repository candidate before evidence-doc update: `3e742fac48563fabcd4b017546a2c689a3a8931d`
- Relationship admission accepted source main: `26586406e33c00b77f76aad4cf72b7ec811069c6`
- Relationship PR #16 exact verified head: `8b5914ce673b567731ef0a90b6fe031ce93a0484`
- PR #16 exact-head CI: `34583624543` — completed success
- Post-merge main CI: `34583715560` — completed success
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
8. `20260911060000_connection_relationships.sql`

Supabase migration ledger versions assigned by the platform:

- `20260911041848` — `social_vertical_slice`
- `20260911041906` — `persisted_alpha_hardening`
- `20260911042225` — `function_execute_hardening`
- `20260911053355` — `social_safety_hardening`
- `20260911053412` — `governed_action_lifecycle`
- `20260911053424` — `provenance_receipt_boundary`
- `20260911053449` — `correction_appeal`
- `20260911092212` — `connection_relationships`

## Gate A — Schema / capability admission

**PASS at the live database boundary.**

Verified live after the relationship migration:

- `profiles`, `blocks`, and `connection_requests` have RLS enabled.
- `connection_requests` has only an authenticated participant SELECT policy; there is no INSERT, UPDATE, or DELETE policy for ordinary browser clients.
- `profiles` uses reciprocal block-aware SELECT semantics.
- the former authenticated direct INSERT policy on `blocks` is removed; blocking routes through `block_user(...)`.
- `request_connection`, `decide_connection_request`, `disconnect_connection`, `block_user`, and `is_blocked_with_current_user` all report `anon_execute=false` and `authenticated_execute=true`.
- relationship RPCs derive the acting identity from `auth.uid()`; acceptance re-checks volatile bilateral block state.
- existing governed-action/provenance/correction authorization boundaries remain intact.

### Security advisor

The latest security advisor reports 11 `authenticated_security_definer_function_executable` warnings across intentionally exposed authenticated privilege boundaries, including:

- `create_space_with_owner`
- `request_governed_agent_action`
- `decide_governed_agent_action`
- `record_approved_action_provenance`
- `request_correction_or_appeal`
- `resolve_correction_or_appeal`
- `request_connection`
- `decide_connection_request`
- `disconnect_connection`
- `block_user`
- `is_blocked_with_current_user`

These warnings are retained as an explicit review surface rather than treated as proof of safety. The newly admitted relationship functions were separately ACL-checked and behavior-probed. They are inaccessible to `anon`, derive caller identity from `auth.uid()`, use an empty `search_path`, and expose narrower mutation authority than direct browser table policies.

Reference: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

## Gate C — Multi-user RLS / governed-action and relationship matrix

**PASS at the live database/RLS boundary.**

Earlier completion-candidate probes used four synthetic UUID-only identities for social/governed-action/provenance/correction checks. The PR #16 relationship admission used three new synthetic UUID-only identities inside a transaction that was rolled back after assertions completed. No personal credentials or persistent test accounts were used.

### Previously admitted social / governed authority checks

Passed live:

- member reaction/report allow and non-member denial;
- bounded agent request allow for approved alpha capability pairs;
- unsupported/self-expanding capability denial;
- ordinary-member approval denial;
- moderator same-Space decision allow;
- action replay denial;
- cross-Space moderator denial;
- approved-action provenance owner/moderator boundary;
- outsider provenance denial;
- correction request allow for member;
- correction resolution moderator-only;
- correction resolution replay denial.

### Relationship / privacy checks

Passed live against the applied `connection_relationships` migration:

- an authenticated user cannot directly INSERT a relationship row; RLS denies the mutation because there is no browser mutation policy;
- User A can request User B through `request_connection(...)`;
- a third nonparticipant cannot read the A-B pending row;
- recipient B can read and accept the pending request;
- after B blocks A through `block_user(...)`, B cannot discover A's profile and cannot read the blocked relationship row;
- the same block is reciprocal at discovery/relationship visibility: A cannot discover B's profile and cannot read the blocked relationship row;
- privileged verification of the terminal row shows `status='blocked'`, the original non-null `decided_at` preserved, and a non-null `ended_at` recorded;
- deleting B's own block does not resurrect the old relationship; its terminal status remains `blocked`;
- A can begin a new relationship lifecycle after unblock, B can accept it, and either participant can disconnect it;
- disconnected state preserves the original decision timestamp and records a separate non-null `ended_at`;
- a pending A-C request cannot be accepted after an intervening C→A block; the acceptance RPC denies the stale action and the pending row remains unchanged;
- `anon` cannot execute the relationship request RPC.

## Gate D — Atomicity and failure behavior

**PASS for database-enforced cases tested to date.**

Verified across the original, completion-candidate, and relationship admission passes:

- duplicate Space slug failure leaves membership cardinality unchanged;
- failed source insertion in `create_source_linked_post` leaves no orphan post;
- removing membership immediately blocks subsequent member-only writes;
- non-pending governed action decisions fail;
- action finalization replay fails;
- cross-Space moderator finalization fails;
- correction resolution replay fails;
- outsider provenance creation fails;
- ordinary browser roles cannot bypass governed action/provenance/correction/relationship authority with direct table policies;
- stale relationship acceptance after an intervening block fails closed;
- block creation and active/pending relationship severance occur in one governed function;
- unblock cannot reactivate a terminal blocked relationship;
- disconnect terminates accepted relationship state without rewriting the earlier acceptance decision.

The application-level requirement that a database denial surfaces as a controlled application error without privileged retry remains coupled to Gate B/runtime verification.

## Performance advisor

Performance findings remain non-blocking alpha optimization debt, not security-completion evidence. They should be handled separately from the correctness/security admission gate so index/policy optimizations do not silently alter the admitted authority model.

References:

- https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
- https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan

## Cleanup verification

The PR #16 relationship matrix executed inside a transaction and ended with `ROLLBACK`. An explicit residue query immediately afterward returned:

- `probe_auth_users=0`
- `probe_profiles=0`
- `probe_blocks=0`
- `probe_connections=0`

Earlier completion-candidate disposable data had also been purged. No real user data was introduced by this verification.

## Remaining gates

Database/RLS admission, including the PR #16 relationship/profile/block boundary, is **PASS**. Overall live Supabase persistence remains **NOT VERIFIED** because Gate B has not run against a configured production browser runtime.

External/runtime requirements are tracked in GitHub issue #10 and include:

- Vercel production public Supabase environment configuration;
- Supabase Auth Site URL / redirect allow-list;
- deployment of the accepted repository main SHA;
- real OTP/PKCE/session/refresh/sign-out/second-user browser matrix;
- controlled application handling of database denials;
- persisted product-loop execution without privileged browser bypass;
- mainline required-check protection;
- human Contextual Trust Comprehension evaluation.

Human connection state does not grant agent capability, Space role, or governance authority. No autonomous-agent, broad-security, production-readiness, Product-loop PASS, or Evaluation PASS follows from this database admission.
