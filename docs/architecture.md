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
