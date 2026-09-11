# Architecture

## System shape

Intellectro begins as a governance-native social application, not as a general autonomous-agent network.

### Layer 0 — Governance kernel

Foundation for all delegated AI activity:

- principal identity
- ownership/accountability chain
- typed capabilities
- deny / allow / approval-required controls
- rate limits
- provenance records
- audit events
- approval gates
- policy versioning
- escalation
- incident response

### Layer 1 — Social Space

Minimum familiar social surface:

- accounts
- profiles
- one public/private-alpha Space
- posts
- comments
- reactions
- memberships/follows
- chronological feed
- reports, blocks, and mutes

### Layer 2 — Governed agents

Only two public-facing agents in the first vertical slice:

- Community Agent
- Claim Agent

A Personal Agent is intentionally deferred until the accountability model is proven.

### Layer 3 — Governance UX

The kernel becomes visible through:

- typed AI-assistance labels
- trust chips
- source and claim context
- approval state
- permission inspector
- action log
- correction / appeal flows

## Four-graph model

### Social graph
People, Spaces, follows, memberships, roles.

### Knowledge graph
Sources, claims, topics, evidence, challenges, qualifications, corrections.

### Agent graph
Human owners, agents, tools, executions, delegated actions.

### Governance graph
Policies, capability grants, denials, approvals, escalations, audits, incidents.

The differentiating behavior occurs when one user action is representable across all four graphs without hiding the transitions.

## Consequential-action control flow

For consequential AI activity, the target control path is:

`request → typed capability → policy decision → approval/verifier when required → execution → durable receipt → challenge/correction`

Each transition is independently meaningful:

- a capability grant does not prove that an action executed;
- an approval does not prove the resulting output is correct;
- execution does not establish truth or efficacy;
- provenance establishes origin/transformation history, not truth;
- a repository implementation does not establish live-runtime verification;
- one project's evidence never authorizes another project.

For higher-impact actions, Intellectro should prefer separation between the component proposing an action and the authority validating it. Depending on the action, that verifier may be a human moderator, a separately scoped policy evaluator, or another independently constrained component.

## Capability-release progression

Broader autonomous authority is earned incrementally rather than enabled as a package. A new consequential capability should not advance beyond its current state until Intellectro has its own:

1. versioned capability and policy definition;
2. explicit owner and scope;
3. deny/approval behavior for missing or ambiguous state;
4. adversarial tests for escalation, replay, stale approval, forged identity, and cross-Space leakage where applicable;
5. durable decision/provenance receipt behavior;
6. rollback or revocation behavior;
7. runtime evidence for the environment where the capability will operate;
8. explicit release decision.

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

Runtime user/content data belongs in the application datastore (initially expected to be Supabase/Postgres plus appropriate object storage).

## Initial implementation shape

A monorepo is preferred while the system is small. Expected top-level areas as implementation begins:

```text
apps/
  web/
packages/
  governance/
  provenance/
  agent-contracts/
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

Directories should be added when code exists; documentation should not create empty structural theater.
