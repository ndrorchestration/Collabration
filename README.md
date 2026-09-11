# Intellectro

**Intellectro is a governed social network where humans build communities with accountable AI infrastructure.**

The alpha thesis is simple: users should be able to participate in a familiar social space while understanding who created content, whether AI was involved, what an agent was allowed to do, who approved public actions, what evidence supports a claim, and how the result can be challenged or corrected.

## Current implementation status

The repository contains the executable governance foundation:

- deny-by-default capability decisions;
- accountable agent ownership validation;
- human approval gates;
- governed rate limiting with denial audit events;
- immutable governed action events;
- provenance records that preserve source and transformation history without claiming truth;
- a bounded Community Agent planning contract;
- a bounded Claim Agent draft contract;
- automated tests and CI.

It now also contains a **demo-mode social vertical slice**:

- one governed Space rendered in Next.js;
- a strictly chronological feed with no ranking model;
- source-linked posts and contextual support/challenge/qualify interactions;
- typed Human-authored, Source-linked, AI-assisted, and Community context cues;
- inspectable context that separates authorship, assistance, evidence, approval, and dispute state;
- Supabase schema/RLS migrations for profiles, Spaces, posts, comments, reactions, claim responses, provenance, agent actions, approvals, reports, blocks, and mutes;
- Supabase SSR/OTP authentication wiring that stays disabled in explicit Demo mode when public configuration is absent.

Live Supabase persistence, persisted profile/membership/comment flows, moderator review tooling, trusted action-log persistence, and model-provider execution remain planned work. Structural RLS checks do not substitute for live multi-user Supabase verification.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run check
npm test
npm run dev:web
```

The governance/domain tests require no production credentials. The web application builds without Supabase secrets and falls back to explicit Demo mode.

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

## Repository layout

```text
apps/
  web/                  Next.js governed social vertical slice
agents/
  claim-agent/          bounded evidence-assistant contract
  community-agent/      bounded community-governance contract
packages/
  governance/           capability, approval, rate-limit, and audit primitives
  provenance/           source/transformation provenance boundary
  social-core/          social objects, chronological feed, trust context
supabase/               versioned schema and RLS migrations
governance/             machine-readable policy/schema artifacts
docs/                   product, architecture, evaluation, threat models, and ADRs
.github/workflows/       automated verification
```

## Documentation map

- [`docs/product-thesis.md`](docs/product-thesis.md) — canonical positioning, user problem, differentiation, and anti-goals
- [`docs/architecture.md`](docs/architecture.md) — layers, graphs, boundaries, and data responsibilities
- [`docs/governance-kernel.md`](docs/governance-kernel.md) — principals, capabilities, controls, invariants, audit events, and rate limits
- [`docs/governance-ux.md`](docs/governance-ux.md) — trust states, contextual disclosure, challenge flows, and progressive inspection
- [`docs/agents.md`](docs/agents.md) — agent roles, permissions, prohibitions, and sequencing
- [`docs/evaluation.md`](docs/evaluation.md) — alpha evaluation plan and Contextual Trust Comprehension metric
- [`docs/mvp-roadmap.md`](docs/mvp-roadmap.md) — phased MVP backlog and deferred scope
- [`docs/threat-model-social-slice.md`](docs/threat-model-social-slice.md) — vertical-slice threats, controls, and required live evidence
- [`docs/research-context.md`](docs/research-context.md) — competitive/research context with evidence-status cautions
- [`docs/history/strategic-evolution.md`](docs/history/strategic-evolution.md) — why the thesis moved from agent-native to governance-native
- [`governance/capability-matrix.yaml`](governance/capability-matrix.yaml) — machine-readable initial policy
- [`governance/action-event.schema.json`](governance/action-event.schema.json) — minimum audit-event shape
- [`docs/adr/`](docs/adr/) — frozen architecture decisions

## Architecture principle

> **Governance kernel first. Social Space immediately. Autonomous agency later, if earned by evidence.**

GitHub is the source of truth for code, schemas, policies, migrations, tests, agent contracts, evaluation assets, and architecture decisions. Live social content and private user data belong in the runtime datastore, not in this repository.
