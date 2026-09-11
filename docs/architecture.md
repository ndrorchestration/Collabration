# Architecture

## System shape

Intellectro begins as a governance-native social application and evolves toward an **accountable collaboration network**, not a general autonomous-agent network.

The foreground experience is people, relationships, Spaces, discussion, shared work, and outcomes. Governance/provenance infrastructure remains underneath the experience and is progressively disclosed when authority or trust matters.

### Layer 0 — Governance kernel

Foundation for all delegated AI activity:

- principal identity
- ownership/accountability chain
- typed capabilities
- deny / allow / approval-required controls
- exact scope
- rate limits
- provenance records
- audit events
- approval gates
- policy versioning
- revocation
- escalation
- incident response

### Layer 1 — Social Space

Minimum familiar social surface:

- accounts
- profiles
- relationships/connections/follows
- public/private Spaces
- invitations and memberships
- posts
- comments
- reactions
- chronological feed
- reports, blocks, and mutes

### Layer 2 — Collaboration domain

Added only as real product behavior appears:

- research questions
- projects
- tasks
- shared artifacts
- decisions / resolved questions
- outcome records
- revision history

A separate `collaboration-core` package is justified only when these rules become substantial enough to have independent domain logic. Until then, avoid structural theater.

### Layer 3 — Governed agents

Current alpha agents:

- Community Agent
- Claim Agent

Future agent:

- Personal Agent — private copilot first, consequential actor later and only capability-by-capability.

The Personal Agent must not inherit ambient account authority merely because it belongs to a user. It receives explicit capabilities and scopes, and its permissions in shared Spaces remain distinct from the user's social relationship with other people.

### Layer 4 — Accountability fabric

The existing provenance/governance packages should evolve into three distinct trust objects rather than one generic record:

1. **Content Passport** — source/revision lineage, transformation activities, and responsible human/agent identities. It does not establish truth.
2. **Action Receipt** — request, actor/owner, capability, scope, policy decision, approval when required, execution result, and resulting artifact reference. It does not establish correctness.
3. **Verification Result** — exact expectations checked, verifier identity/scope, result, and timestamp. It does not establish broader certification.

These objects may link to one another, but their semantics remain distinct.

### Layer 5 — Governance UX

The kernel becomes visible through progressive disclosure:

1. **lightweight state** — typed AI verbs/trust chips such as `AI summarized`, `AI drafted`, `human approved`, `awaiting approval`, `source linked`, `challenged`;
2. **context card** — authorship, AI role, authority, sources/revisions, approval, dispute/correction/currentness;
3. **technical evidence** — action receipt, verification result, policy/capability identity, audit history.

Ordinary human conversation should not require interacting with the technical evidence layer.

## Four-graph model

### Social graph
People, Spaces, connections/follows, invitations, memberships, roles.

### Knowledge graph
Sources, source revisions, claims, topics, evidence, challenges, qualifications, corrections, supersession/currentness.

### Agent graph
Human owners, Personal/Community/Claim agents, tools, executions, delegated tasks, parent/child agent relationships.

### Governance graph
Policies, capability grants, scopes, denials, approvals, revocations, escalations, audits, incidents.

The differentiating behavior occurs when one user action is representable across all four graphs without hiding the transitions.

The graphs are linked but non-substitutable:

- friendship does not grant agent authority;
- agent ownership does not grant Space permission;
- a source does not make a claim true;
- approval does not make output correct;
- provenance does not imply factuality;
- verification results apply only to the exact expectations tested.

## Consequential-action control flow

For consequential AI activity, the target control path is:

`request → typed capability → policy decision → approval/verifier when required → single-use authorization → execution → durable receipt → challenge/correction`

Each transition is independently meaningful:

- a capability grant does not prove that an action executed;
- an approval does not prove the resulting output is correct;
- execution does not establish truth or efficacy;
- provenance establishes origin/transformation history, not truth;
- a repository implementation does not establish live-runtime verification;
- one project's evidence never authorizes another project.

For higher-impact actions, Intellectro should prefer separation between the component proposing an action and the authority validating it. Depending on the action, that verifier may be a human moderator, a separately scoped policy evaluator, or another independently constrained component.

## Exact-action authorization target

Before the Personal Agent receives consequential shared-state authority, authorization should be bound to the exact intended action rather than become ambient permission.

Canonicalize at least:

`actor + agent + owner + capability + scope + target revision + relevant input revisions + operation parameters + policy version`

into an `action_digest`.

An approval/authorization should bind to that digest, approver/verifier, decision, issue time, expiration/TTL, nonce/single-use state, and policy identity. Execution must re-check volatile predicates such as membership, role, revocation, and scope.

Target invariant:

> **An approval authorizes exactly one defined action under one defined context; it does not create reusable ambient authority.**

This is a target design requirement, not a claim that the current alpha already implements digest-bound authorization.

## Progressive authority

Personal Agent authority progresses deliberately:

`private suggestion → private draft → user-approved share → user-approved shared-state action → narrowly preauthorized reversible action → carefully released automation`

Initial no-approval behavior may include permitted-context retrieval, public/attached-source research, organization, summarization, comparison, drafting, and private notes.

Shared publication, messaging another person, modifying shared tasks, inviting collaborators, exporting private information, or invoking community agents on shared content require an explicit applicable capability and approval policy.

Policy mutation, self-granted capabilities, destructive moderation, disclosure of another user's private context, spending/purchase authority, and unrestricted autonomous public posting remain denied until separately designed and released, if ever.

## Personal Agent memory boundary

Personal Agent memory must be scope-aware and inspectable before it becomes powerful or persistent. A memory item should be able to record:

- `owner_id`
- visibility: `private`, `space`, `project`, `ephemeral`
- exact `scope_id` when non-private
- `origin_ref`
- `created_by` human/agent/imported source
- retention / `expires_at`
- user edit/delete controls
- sensitivity classification
- `derived_from` provenance for inferred/summary memory

A target UX is **“Why does my agent know this?”**, allowing the user to see whether an answer came from private notes, a Space discussion, a project artifact, an external source, or model inference.

Private memory must never silently become community context. Cross-scope memory reads and disclosures must fail closed and receive adversarial tests.

## Revision-aware currentness

Derived AI content should bind to exact source revisions. If inputs later change, the historical receipt remains valid for the revisions actually consumed, while the UI can mark the derivative as **inputs changed since generation**.

Do not silently rewrite history and do not equate stale/currentness state with falsehood. This distinction is especially important for summaries, research packets, community digests, and long-lived project artifacts.

## Delegation attenuation

Future agent-to-agent delegation must preserve or reduce authority, never mint new authority. A child/specialist agent may receive only a subset of its parent's allowed capability, scope, budget, tool set, and lifetime.

Personal Agent → specialist agent → Community Agent collaboration must not be usable to launder an action that the Personal Agent itself could not perform.

## Capability-release progression

Broader autonomous authority is earned incrementally rather than enabled as a package. A new consequential capability should not advance beyond its current state until Intellectro has its own:

1. versioned capability and policy definition;
2. explicit owner and scope;
3. deny/approval behavior for missing or ambiguous state;
4. adversarial tests for escalation, replay, stale approval, forged identity, cross-Space leakage, and delegation laundering where applicable;
5. durable decision/provenance receipt behavior;
6. rollback or revocation behavior;
7. runtime evidence for the environment where the capability will operate;
8. explicit release/hold decision.

This progression is inspired by governance lessons developed elsewhere in the NDR ecosystem, including DGAF, but the implementation and evidence are strictly Intellectro-native. See [`docs/adr/0004-pattern-transfer-without-authority-transfer.md`](adr/0004-pattern-transfer-without-authority-transfer.md).

## Pattern-transfer boundary

Intellectro may reuse governance patterns from DGAF or other NDR projects as design inputs. It does not inherit their authorization state, verification class, scientific claims, experiment results, freeze state, custody evidence, or efficacy claims.

Adoption requires an Intellectro specification, implementation, tests, runtime evidence when applicable, and product-appropriate user semantics. Matching terminology is never sufficient evidence of matching behavior.

## Repository boundaries

This repository should version:

- application and service code
- database migrations
- RLS/security policies
- agent contracts
- governance policies
- provenance and audit schemas
- evaluation fixtures and tests
- architecture decisions
- security procedures
- deployment configuration

This repository should **not** store:

- live private social content
- production secrets
- private user data
- unresolved vulnerability details intended to remain confidential
- sensitive abuse-detection thresholds

Runtime user/content data belongs in the application datastore (Supabase/Postgres plus appropriate object storage for the current architecture).

## Runtime-mode boundary

Runtime mode is an explicit state, not an inference that missing configuration means demo authority.

```text
intentional local/demo mode + no persistence config
  → clearly labelled browser-local demo permitted

configured runtime + complete public persistence config
  → server-derived identity + Supabase/RLS path

production runtime + missing/partial persistence config
  → unhealthy / misconfigured / fail closed
  → never silently activate demo authority
```

Demo state may illustrate product concepts but cannot represent an authenticated actor, authoritative approval, persisted provenance receipt, or live governed action.

## Initial implementation shape

A monorepo is preferred while the system is small. Current/expected top-level areas include:

```text
apps/
  web/
packages/
  governance/
  provenance/
  social-core/
agents/
  community-agent/
  claim-agent/
supabase/
governance/
evaluations/
docs/
tests/
.github/
```

Potential future `personal-agent`, `agent-runtime`, or `collaboration-core` areas should be added only when executable domain behavior justifies them; documentation should not create empty structural theater.
