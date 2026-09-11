# Alpha Completion Gates

## Current verdict

**Alpha Complete: NO.**

Repository work is advancing on a bounded completion branch, but Runtime, Product-loop, Security/Operations, and Evaluation predicates remain independently gated. No implementation, CI, deployment, database, or panel result may substitute for another predicate.

| Predicate | Current state | Completion evidence |
| --- | --- | --- |
| Repository | IN PROGRESS | Exact-head CI on the accepted completion candidate |
| Runtime | NOT VERIFIED | Production `/api/health` reports the accepted SHA and `persistence=configured`; browser Gate B passes |
| Product-loop | NOT VERIFIED | Canonical human → claim/context → governed agent draft → moderator decision → inspectable record path exercised end to end |
| Security | IN PROGRESS | Adversarial regression pack + live session/access-control checks have no unresolved high-impact finding |
| Operations | NOT VERIFIED | Mainline change controls, runtime evidence capture, rollback/recovery expectations, and current docs are established |
| Evaluation | NOT VERIFIED | Contextual Trust Comprehension alpha run recorded with limitations and secondary metrics |

## Repository gate

Required before repository completion:

- social safety paths: reactions, reports, blocks, mutes;
- permission inspector;
- governed action-log viewer;
- moderator review queue and one-way pending decision lifecycle;
- narrow provenance receipt writer without a general browser INSERT policy;
- correction/appeal flow preserving original history;
- adversarial regression coverage;
- README/roadmap/evidence documentation aligned with actual live state;
- exact-head Node 22, Node 24, governance validation, tests, and Next.js production build PASS.

## Runtime gate

**Current: NOT VERIFIED.**

Prerequisites:

1. Vercel production runtime has `NEXT_PUBLIC_SUPABASE_URL` for dedicated project `hibesaapldkvgkydvbds`.
2. Vercel production runtime has the dedicated project's browser-public publishable key.
3. Supabase Auth Site URL is `https://intellectro.vercel.app`.
4. Production redirect allow-list admits `https://intellectro.vercel.app/auth/callback?next=/app`.
5. A fresh production deployment is bound to the accepted Git SHA.
6. `/api/health` returns that SHA and `persistence=configured`.
7. Real browser Gate B passes OTP/magic-link initiation, PKCE exchange, cookie session, `/app` claims validation, refresh/no-store behavior, sign-out, unsafe redirect rejection, and second-user isolation.

Database/RLS PASS does not satisfy this gate.

## Product-loop gate

Exercise this complete path with real persisted identities and no privileged browser bypass:

`Human joins Space → source-linked claim → Claim Agent draft/analysis → another human challenges or qualifies → Community Agent draft summary → moderator approves/rejects/edits → public artifact only after permitted execution → action/provenance/approval records inspectable → correction/appeal path available`

A missing model provider must fail closed. Test fixtures or user-supplied text must not be represented as real AI output.

## Security and operations gate

Required evidence includes:

- no actor/approver identity accepted from an untrusted form field;
- no anonymous governed RPC execution;
- no ordinary browser INSERT policy for `agent_actions` or `provenance_records`;
- no agent self-escalation or autonomous public posting;
- cross-Space moderator action denied;
- replayed/finalized action decisions rejected;
- protocol-relative/off-origin auth callback targets rejected;
- no authenticated-response shared caching/session leakage;
- report/block/mute do not silently become ban/delete authority;
- `main` has enforced required-check change protection where the GitHub account/control plane supports it; otherwise the setting remains an explicit external blocker.

## Evaluation gate

The primary metric is **Contextual Trust Comprehension**. At minimum, the alpha record must test whether users can correctly identify:

1. original human author;
2. whether AI was involved;
3. what the AI was allowed to do;
4. who approved a public AI-derived artifact;
5. what sources support the claim;
6. whether the community is in agreement/dispute;
7. how to challenge or correct the result.

Also record governance burden and summary faithfulness. Do not infer efficacy from interface completion or participant anecdotes.

## Authority-expansion rule

Alpha completion does **not** authorize autonomous public posting, autonomous moderation, autonomous deletion/banning, policy mutation, capability self-expansion, marketplace/federation, or ranking. Any expansion requires separate evidence, threat review, tests, and ADR.
