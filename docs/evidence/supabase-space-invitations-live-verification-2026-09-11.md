# Supabase Space Invitation Live Verification — 2026-09-11

## Scope and source binding

This record captures live database/RLS admission of the controlled Space invitation and join-policy boundary implemented by PR #24.

- accepted repository source before this evidence PR: `9a474c15ea7cb453e1d7384ed3a772c21c5c815d`
- repository migration: `supabase/migrations/20260911062000_space_invitations.sql`
- dedicated Supabase project: `hibesaapldkvgkydvbds`
- live migration ledger entry: `20260912004221 space_invitations`
- repository post-merge CI on the accepted source: `34599911307` — SUCCESS

This is a database/RLS admission record. It does **not** establish Browser Gate B, configured Vercel persistence, production readiness, real-model execution, human evaluation, or broader agent authority.

## Structural admission

Live schema/policy inspection after the migration confirmed:

- `spaces.join_policy` exists, is `NOT NULL`, defaults to `open`, and is constrained by the repository migration to `open | invite_only`;
- the legacy generic `spaces creator update` policy is absent;
- the legacy direct `memberships self join` policy is absent;
- `space_invitations` has RLS enabled;
- `space_invitations` exposes participant SELECT only and no ordinary-browser INSERT/UPDATE mutation policy;
- `join_open_space`, `set_space_join_policy`, `invite_to_space`, `decide_space_invitation`, and `revoke_space_invitation` are authenticated RPC boundaries with `anon_execute=false` and `authenticated_execute=true`;
- `is_space_admin` is an authenticated `SECURITY INVOKER` helper with `anon_execute=false`;
- the extended `block_user` boundary remains `anon_execute=false`, `authenticated_execute=true`;
- all inspected invitation/join-policy functions use an empty `search_path`.

This also resolves the repository/live authority-path ambiguity tracked in issue #26: `join_policy` is no longer mutable through the old generic creator-wide UPDATE policy.

## Live behavioral matrix

A disposable five-user/two-Space synthetic probe exercised the admitted migration using authenticated identity claims. Result: **13/13 PASS**.

| Check | Result |
| --- | --- |
| Open Space join creates `member` membership only | PASS |
| Invite-only direct join is denied | PASS |
| Non-admin join-policy change is denied | PASS |
| Invitation creation requires `invite_only` policy | PASS |
| Admin join-policy change through the narrow RPC is allowed | PASS |
| Non-admin invitation creation is denied | PASS |
| Admin-created invitation grants `member` only | PASS |
| Only the invitee may accept/decline | PASS |
| Accepted invitation creates member membership | PASS |
| Replayed invitation finalization is rejected | PASS |
| Acceptance rechecks current Space policy and rejects stale invitation state | PASS |
| Admin may revoke a still-pending invitation | PASS |
| Bilateral block terminalizes a pending invitation without creating membership | PASS |

The probe therefore exercised both positive and negative authority paths rather than treating successful migration application as sufficient evidence.

## Cleanup verification

All disposable verification state was purged after the probe. Explicit residue counts:

- `probe_users = 0`
- `probe_spaces = 0`
- `probe_invitations = 0`
- `probe_memberships = 0`
- `probe_blocks = 0`

No real user credentials or personal content were used.

## Advisor state

### Security

Before this migration the Supabase security advisor reported 11 `authenticated_security_definer_function_executable` warnings on the already-reviewed authenticated RPC surface. After admission it reports 16 warnings: the five additional findings are the expected authenticated `SECURITY DEFINER` boundaries introduced for controlled join/invitation operations.

Independent ACL inspection confirmed the new RPCs remain `anon_execute=false`; no anonymous-execution warning was introduced. These warnings remain an explicit review surface rather than being interpreted as proof of either safety or vulnerability.

Reference: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

### Performance

- unindexed foreign-key findings: `17 -> 17` (unchanged);
- `auth_rls_initplan` findings: `21 -> 19`.

The two-count reduction follows removal of the legacy creator Space-update and direct self-join policies. Remaining performance debt stays isolated in issue #11 and does not alter the authority verdict recorded here.

References:
- https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
- https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan

## Verdict

**Space invitation / join-policy database-RLS admission: PASS.**

The live database now enforces the intended separation between open joining, invite-only joining, current-admin policy changes, invitation participants, replay protection, and bilateral block precedence. Human Space membership continues to grant no agent capability or independent governance authority.

Still fail-closed:

- Browser Gate B: **NOT VERIFIED**;
- production Vercel persistence: **NOT VERIFIED**;
- `main` protection: **NOT VERIFIED / not enforced at the last repository check**;
- real provider-backed product loop: **NOT VERIFIED**;
- human Contextual Trust Comprehension evaluation: **NOT VERIFIED**;
- Alpha Complete: **NO**.
