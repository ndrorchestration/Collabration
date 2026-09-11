# Alpha Completion Gates

## Current verdict

**Alpha Complete: NO.**

The repository-controlled alpha surface is candidate-complete and the dedicated Supabase database/RLS completion candidate has passed live admission. Runtime browser authentication, the real persisted product loop, mainline operations controls, and human evaluation remain independently gated. No implementation, CI, deployment, database, or panel result may substitute for another predicate.

External completion controls that cannot be mutated from the currently connected management surfaces are tracked in GitHub issue #10.

| Predicate | Current state | Completion evidence |
| --- | --- | --- |
| Repository | CANDIDATE COMPLETE | Social safety, governance inspection, pending-action lifecycle, provenance receipt, correction/appeal, adversarial pack, aligned docs; current PR must still be terminal-green on its final exact head before merge |
| Database/RLS | PASS | Completion migrations admitted to dedicated project; ACL/RLS/advisor review plus synthetic positive/negative authority probes passed and probe data was purged |
| Runtime | NOT VERIFIED | Production `/api/health` reports the accepted SHA and `persistence=configured`; browser Gate B passes |
| Product-loop | NOT VERIFIED | Canonical human → claim/context → real bounded agent work → moderator decision → permitted publication → inspectable record path exercised end to end |
| Security | PARTIAL PASS | Repository adversarial pack and live DB/RLS authority checks pass; real browser/session/cache and runtime denial behavior remain pending |
| Operations | NOT VERIFIED | Mainline required-check protection, production configuration/evidence capture, rollback/recovery expectations, and runtime incident controls are established |
| Evaluation | NOT VERIFIED | Contextual Trust Comprehension alpha run recorded with real participant evidence, limitations, and secondary metrics |

## Repository gate

Implemented in the alpha-completion candidate:

- social safety paths: reactions, reports, blocks, mutes;
- permission inspector;
- governed action-log viewer;
- moderator review queue and one-way pending decision lifecycle;
- narrow approved-action provenance receipt writer without a general browser INSERT policy;
- append-only correction/appeal flow preserving original history;
- adversarial regression coverage for forged identity, cross-Space moderation, replay, self-expansion, direct audit/provenance bypass, unsafe redirect, and viewer-local block/mute semantics;
- README/roadmap/threat/evidence documentation aligned with actual admitted state.

Merge requirement remains fail-closed: the **final PR head** must pass Node 22, Node 24, governance validation, full tests, and the Next.js production build. A prior green commit is not transferable to a later documentation/code head.

## Database/RLS gate

**Current: PASS for the admitted completion candidate.**

Live evidence is recorded in `docs/evidence/supabase-live-verification-2026-09-11.md` and includes:

- all seven repository migrations admitted in order;
- anonymous execution denied on governed RPCs;
- ordinary browser roles retain no direct `agent_actions`/`approval_records`/`provenance_records`/`correction_requests` mutation path that bypasses the designed boundary;
- member reaction/report positive checks and outsider denial checks;
- allowed governed request positive check and malformed/self-expanding capability denial;
- ordinary-member decision denial, moderator decision positive check, replay denial, and cross-Space moderator denial;
- approved-action provenance positive check and outsider denial;
- correction request positive check, ordinary-member resolution denial, moderator resolution positive check, and replay denial;
- disposable probe data purged to zero afterward.

Database/RLS PASS does **not** satisfy Runtime, Product-loop, Operations, or Evaluation.

## Runtime gate

**Current: NOT VERIFIED.**

Prerequisites:

1. Vercel production runtime has `NEXT_PUBLIC_SUPABASE_URL` for dedicated project `hibesaapldkvgkydvbds`.
2. Vercel production runtime has the dedicated project's browser-public publishable key.
3. Supabase Auth Site URL is `https://intellectro.vercel.app`.
4. Production redirect allow-list admits `https://intellectro.vercel.app/auth/callback?next=/app`.
5. A fresh production deployment is bound to the accepted Git SHA.
6. `/api/health` returns that SHA and `persistence=configured`.
7. Real browser Gate B passes OTP/magic-link initiation, PKCE exchange, cookie session, `/app` claims validation, refresh/no-store behavior, sign-out, unsafe redirect rejection, second-user isolation, and controlled database-denial behavior.

The exact settings and evidence requirements are tracked in issue #10.

## Product-loop gate

Exercise this complete path with real persisted identities and no privileged browser bypass:

`Human joins Space → source-linked claim → bounded Claim Agent work → another human challenges or qualifies → bounded Community Agent summary work → moderator approves/rejects/edits → public artifact only after permitted execution → action/provenance/approval records inspectable → correction/appeal path available`

Current repository requests/approvals create governance records only; they intentionally do not invoke a model or publish output. A missing model provider must fail closed. Test fixtures or user-supplied text must not be represented as real AI output. No paid provider usage is authorized by repository completion.

## Security gate

Repository and live database checks now establish:

- no actor/approver/requester identity accepted from an untrusted form field;
- no anonymous governed RPC execution;
- no ordinary browser INSERT policy for `agent_actions` or `provenance_records`;
- no direct approval/correction write path that bypasses the narrow RPC lifecycle;
- no agent self-escalation or autonomous public posting;
- malformed/self-expanding capability request denied;
- cross-Space moderator action denied;
- replayed/finalized action decisions rejected;
- correction resolution replay rejected;
- outsider provenance creation rejected;
- protocol-relative/off-origin auth callback targets rejected structurally;
- report/block/mute do not silently become ban/delete authority.

Still required before Security can fully pass:

- real authenticated browser/session/cache isolation evidence;
- controlled application behavior when live database authorization denies a write;
- realistic multi-account abuse/rate-limit testing.

## Operations gate

**Current: NOT VERIFIED.**

Required:

- `main` enforced through PR/required-check change protection where the GitHub account/control plane supports it;
- exact required checks include Node 22 governance/domain tests, Node 24 governance/domain tests, and Next.js production build;
- production environment configuration is inspectable and excludes privileged browser credentials;
- deployment/runtime evidence is captured against exact Git SHA;
- rollback/recovery expectations, logging, secret management, and incident response are documented/testable.

The connected GitHub/Vercel management surfaces do not currently expose the required ruleset/environment mutations, so these controls remain explicit blockers in issue #10 rather than inferred PASS states.

## Evaluation gate

The primary metric is **Contextual Trust Comprehension**. At minimum, the alpha record must test whether real participants can correctly identify:

1. original human author;
2. whether AI was involved;
3. what the AI was allowed to do;
4. who approved a public AI-derived artifact;
5. what sources support the claim without treating provenance as truth;
6. whether the community is in agreement/dispute;
7. how to challenge, correct, or appeal the result.

Also record governance burden and summary faithfulness. Do not infer efficacy from interface completion, database verification, or participant anecdotes.

## Accepted nonblocking performance debt

The latest Supabase performance advisor reports:

- 17 unindexed foreign keys;
- 22 older RLS init-plan optimization findings.

These are optimization debt, not evidence that the current authority model failed. They should be remediated under a separate performance change so any policy/index change receives its own regression and live-verification wave.

## Authority-expansion rule

Alpha completion does **not** authorize autonomous public posting, autonomous moderation, autonomous deletion/banning, policy mutation, capability self-expansion, marketplace/federation, or ranking. Any expansion requires separate evidence, threat review, tests, and ADR.