# Alpha Evaluation Plan

## Evaluation doctrine

Intellectro should evaluate **correct distinctions and useful outcomes**, not a single generalized “trust score.” A system can increase reported trust while making people more overconfident.

Keep at least these dimensions separate:

`authorship comprehension · AI-role comprehension · authority comprehension · provenance/truth separation · currentness comprehension · correction discoverability · governance burden · useful-outcome rate`

Repository implementation, live runtime verification, human comprehension, factual quality, and product usefulness are separate evidence classes.

## Primary metric: Contextual Trust Comprehension

The central alpha question is whether users can correctly identify:

1. who authored the original content;
2. whether AI was involved and what transformation it performed;
3. what the AI was allowed to do in that context;
4. whether approval was required and who approved the consequential version/action;
5. what sources/revisions informed the artifact;
6. whether source-linked/provenance state is being incorrectly interpreted as truth;
7. whether relevant inputs have changed since generation;
8. whether the community is in agreement, qualification, challenge, or unresolved dispute;
9. how the user could challenge, correct, revoke, or appeal where applicable.

The goal is **understanding**, not maximizing action-log visits or reported trust.

## Controlled comprehension stimuli

Formative human testing should include deliberately contrasting cases:

| Stimulus | What it tests |
|---|---|
| Human-authored, no AI | False-positive AI attribution |
| AI-drafted, human-approved | Difference between AI generation and human approval |
| Agent-generated, awaiting approval | Whether pending state prevents premature interpretation as approved/public authority |
| Source-linked but factually false | Provenance-as-truth confusion |
| Unsourced but factually true | Absence-of-provenance-as-false confusion |
| Well-sourced but community-disputed | Source support vs community consensus |
| Corrected version with visible lineage | Understanding correction without historical rewriting |
| Summary whose bound inputs changed afterward | Revision/currentness understanding |
| Same content with chip-only vs contextual detail available | Value and burden of progressive disclosure |

Do not assume a fixed participant count before formative work exposes misunderstanding categories and variance. Use formative sessions first; power any later confirmatory comparison from observed pilot behavior.

## Secondary metrics

### Comprehension / UX

- percentage noticing trust chips when relevant
- correct interpretation of typed AI-assistance verbs
- time to obtain needed authority/provenance context
- correction/appeal discoverability
- revision-staleness/currentness interpretation
- user-reported and observed governance burden
- abandonment caused by approval/context steps

### Collaboration / product value

- **Weekly Collaborative Outcomes:** accepted shared artifacts, resolved research questions, completed collaborative tasks, or project outputs with meaningful human participation
- activation to first useful collaboration
- conversation-to-project/task/artifact conversion
- repeated collaboration among connected users/Space members
- return rate after users reach a collaborative outcome vs users who do not

### Agent value

- Personal/Community/Claim Agent drafts explicitly accepted, edited, rejected, or reused
- summary faithfulness
- source coverage when source use is expected
- stale-input detection
- human edits required before sharing
- model/tool cost per accepted outcome when real execution exists

### Community health

- challenge-to-comment ratio (descriptive only; not a quality score)
- challenge outcomes and evidence use
- reports/harassment associated with challenge mechanics
- moderator approval latency
- correction resolution time

### Structural integrity / reliability

- percentage of consequential agent actions with required owner/policy/scope/action/provenance fields
- authentication success/failure
- governance queue latency
- action execution error rate
- p95 agent/task latency once model execution exists

## Vertical-slice experiment

Current bounded-agent slice:

```text
Human joins Space
→ posts a source-linked claim
→ governed Claim Agent work is requested
→ another human challenges or qualifies the claim
→ governed Community Agent work is requested
→ moderator reviews and approves/rejects where required
→ system records policy, decision, action, provenance, correction/appeal state
```

Do not describe the current record-only request/approval lifecycle as real model execution until a provider-backed path exists and is separately verified.

Future accountable-collaboration slice:

```text
Two or more humans connect / share a Space
→ discuss a real question
→ one asks a Personal Agent to research/draft privately
→ human reviews
→ exact bounded share is approved
→ collaborators support/challenge/qualify
→ discussion becomes project/task/artifact
→ Community Agent summarizes unresolved state
→ humans decide consequential outcome
→ Content Passport / Action Receipt / correction lineage remain inspectable
```

## Initial governance tests

### Permission test
The Community Agent cannot delete, ban, change policy, grant itself capabilities, or publish where approval is required.

### Attribution test
Every consequential agent action contains an accountable owner, policy version, scope, timestamp, and applicable provenance/action references.

### Rate-limit test
An agent exceeding its action quota is denied under declared semantics without fail-open behavior.

### Replay/substitution test
An approval or finalized action cannot be replayed or substituted for a different action/target.

### Cross-scope test
An agent authorized in one Space/project cannot read/write another scope without independently applicable authority.

### Memory-isolation test — future Personal Agent gate
Private Personal Agent memory cannot become Space/community context without explicit bounded disclosure authority.

## Failure-oriented release matrix

Before expanding authority, test negative cases at least as strongly as the happy path:

- forged actor/owner identity
- cross-Space access
- capability self-escalation
- approval substitution
- approval replay
- expired/stale approval
- authority revoked between approval and execution
- prompt injection attempting tool/permission expansion
- fabricated tool name/arguments
- private-memory exfiltration
- delegation laundering through another agent
- concurrent rate-limit race
- source revision drift after generation
- receipt/provenance tampering
- required verifier unavailable
- correction-resolution replay
- governance queue starvation behind display-history caps
- production missing/partial runtime configuration
- demo identity/state submitted into configured production path
- cross-user session/cache leakage

The expected behavior for an out-of-scope or ambiguous consequential action is fail closed with a typed reason and, where appropriate, an auditable event.

## Product-quality guardrails

A technically correct governance system still fails if:

- users cannot interpret its labels;
- users confuse provenance, approval, verification, confidence, consensus, or truth;
- users feel ordinary conversation is bureaucratic;
- the Community Agent appears to be the final authority;
- Personal Agent memory surprises users or crosses expected privacy scopes;
- challenges become a harassment/reputation mechanic;
- governance interaction prevents useful collaboration;
- the social experience stops feeling socially alive;
- agent/model cost grows without accepted useful outcomes.

## Evidence promotion

Do not promote a product claim because one evidence class passes another:

- repository CI PASS ≠ live runtime verified;
- runtime verified ≠ human-comprehensible;
- human-approved ≠ factually correct;
- provenance complete ≠ true;
- model quality result ≠ safe authority expansion;
- user-reported trust ≠ correct understanding.

Any capability release should name the exact evidence supporting implementation, runtime operation, adversarial behavior, human factors when applicable, and rollback/revocation readiness.
