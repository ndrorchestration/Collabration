# Intellectro

**Intellectro is a governed social network where humans build communities with accountable AI infrastructure.**

The alpha thesis is simple: users should be able to participate in a familiar social space while understanding who created content, whether AI was involved, what an agent was allowed to do, who approved public actions, what evidence supports a claim, and how the result can be challenged or corrected.

## Product promise

Intellectro aims to be:

- **Socially familiar** — profiles, Spaces, posts, comments, reactions, and a chronological feed.
- **Epistemically inspectable** — sources, claims, uncertainty, disputes, and corrections can be examined when relevant.
- **Agentically accountable** — agent identity, ownership, permissions, approvals, rate limits, and action history are visible and enforceable.
- **Community-governed** — AI supports human communities under explicit policies rather than silently becoming the authority.

## Alpha scope

- One attractive social Space
- One chronological feed
- Human profiles, posts, and comments
- Source-linked posts
- Support / challenge / qualify interactions
- One Community Agent
- One Claim Agent
- Deny-by-default capability permissions
- Human approval for public agent output
- Rate-limited automation
- Visible trust/context cues
- Provenance records
- Inspectable action log

## Governance principles

1. Every agent has an accountable owner.
2. Every agent action uses a typed capability.
3. Every public agent action is attributable.
4. High-impact actions are reversible or human-approved.
5. Automated actions are rate-limited.
6. AI-derived artifacts preserve inputs and transformation history.
7. Moderator decisions record the policy version used.
8. Agents cannot expand their own permissions.
9. Provenance establishes origin and transformation history; it does not by itself establish truth.
10. Governance should appear when trust matters, not burden ordinary human expression.

## Core loop

`post → inspect → discuss → coordinate → produce outcome`

MVP proving path:

`Human joins Space → posts a source-linked claim → Claim Agent analyzes it → another human challenges or qualifies it → Community Agent summarizes the disagreement → moderator approves the summary → provenance and action records are preserved`

## Documentation map

- [`docs/product-thesis.md`](docs/product-thesis.md) — canonical positioning, user problem, differentiation, and anti-goals
- [`docs/architecture.md`](docs/architecture.md) — layers, graphs, boundaries, and data responsibilities
- [`docs/governance-kernel.md`](docs/governance-kernel.md) — principals, capabilities, controls, invariants, audit events, and rate limits
- [`docs/governance-ux.md`](docs/governance-ux.md) — trust states, contextual disclosure, challenge flows, and progressive inspection
- [`docs/agents.md`](docs/agents.md) — agent roles, permissions, prohibitions, and sequencing
- [`docs/evaluation.md`](docs/evaluation.md) — alpha evaluation plan and Contextual Trust Comprehension metric
- [`docs/mvp-roadmap.md`](docs/mvp-roadmap.md) — phased MVP backlog and deferred scope
- [`docs/research-context.md`](docs/research-context.md) — competitive/research context with evidence-status cautions
- [`docs/history/strategic-evolution.md`](docs/history/strategic-evolution.md) — why the thesis moved from agent-native to governance-native
- [`governance/capability-matrix.yaml`](governance/capability-matrix.yaml) — machine-readable initial policy
- [`governance/action-event.schema.json`](governance/action-event.schema.json) — minimum audit-event shape
- [`docs/adr/`](docs/adr/) — frozen architecture decisions

## Architecture principle

> **Governance kernel first. Social Space immediately. Autonomous agency later, if earned by evidence.**

GitHub is the source of truth for code, schemas, policies, migrations, tests, agent contracts, evaluation assets, and architecture decisions. Live social content and private user data belong in the runtime datastore, not in this repository.
