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
- a revision-aware Content Passport `0.1.0-alpha` package contract that binds subject/source revisions, ordered transformations, accountable human/agent actors, immutable snapshots, and fail-closed currentness states without claiming truth or correctness;
- a bounded Community Agent planning contract;
- a bounded Claim Agent draft contract;
- automated tests and CI.

It also contains the first **persisted-alpha application boundary**:

- a Next.js governed social shell plus an authenticated `/app` runtime surface;
- a strictly chronological feed with no ranking model;
- source-linked posts and contextual support/challenge/qualify/add-evidence interactions;
- typed Human-authored, Source-linked, AI-assisted, and Community context cues;
- reactions plus report, block, mute, unblock, and unmute controls;
- person-to-person connection requests with explicit pending/accepted/declined/cancelled/disconnected/blocked lifecycle, including accept, decline, cancel, and disconnect UI paths;
- bilateral block precedence that is designed to hide blocked profiles/relationship rows at the database boundary and terminate pending/accepted connections without deleting another person's content;
- explicit UX language that a human connection grants no agent permission, Space role, or governance authority;
- Supabase SSR authentication with request-scoped clients, validated claims, PKCE callback handling, refresh-cookie propagation, and non-cacheable authenticated responses;
- server actions that derive author/owner/requester identity from validated claims rather than client-supplied IDs;
- persisted profile, Space creation/join, post, source-linked post, comment, and contextual-response paths;
- a permission inspector projected from the canonical capability matrix;
- an RLS-bound governed action log and moderator review queue;
- a narrow pending governed-action request/decision lifecycle that records human approval or rejection without executing a model or publishing output;
- an approved-action provenance receipt boundary that preserves provenance without claiming truth;
- an append-only correction/appeal workflow whose resolution does not rewrite the original post or governed action;
- versioned Supabase migrations with RLS on every admitted runtime table and repository checks for the connection-relationship candidate;
- membership-gated social writes, atomic Space-owner creation, author-controlled direct source linkage, and Space-scoped moderator decisions;
- no ordinary client insert path for `agent_actions` or `provenance_records`;
- explicit Demo/fail-closed behavior when Supabase public configuration is absent.

**Important evidence boundary:** the dedicated Intellectro Supabase project has the pre-relationship canonical migrations applied and its admitted database/RLS boundary, function ACLs, governed-action authorization, provenance authority, correction/appeal authority, and tested database-enforced failure cases have passed. The newer connection-relationship migration is **repository-verified only** until it is separately applied and live-probed on that dedicated project. Overall live persistence remains **NOT VERIFIED** because production browser auth/session Gate B is still **NOT VERIFIED**. Production must continue to fail closed when its public Supabase runtime configuration is absent.

Repository-controlled moderator review, governed action/provenance boundaries, correction/appeal, Content Passport semantics, and the connection relationship candidate are implemented. Still open are live admission of the relationship migration, production runtime configuration, real browser Gate B, realistic multi-account abuse/rate-limit testing, mainline required-check protection, a real model-backed governed product loop, and the human Contextual Trust Comprehension evaluation. Any future model-provider integration must remain server-only and fail closed when unconfigured; repository completion does not authorize paid provider use or autonomous public posting.

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm ci
npm run check
npm test
npm run dev:web
```

The governance/domain tests require no production credentials. The web application builds without Supabase secrets and falls back to explicit Demo mode when the public Supabase URL and publishable key are absent.

## Product promise

Intellectro aims to be:

- **Socially familiar** — profiles, human connections, Spaces, posts, comments, reactions, and a chronological feed.
- **Epistemically inspectable** — sources, claims, uncertainty, disputes, corrections, and revision/currentness context can be examined when relevant.
- **Agentically accountable** — agent identity, ownership, permissions, approvals, rate limits, and action history are visible and enforceable.
- **Community-governed** — AI supports human communities under explicit policies rather than silently becoming the authority.

## Alpha scope

- One attractive social Space
- One chronological feed
- Human profiles and explicit connection relationships
- Human posts and comments
- Source-linked posts
- Support / challenge / qualify interactions
- One Community Agent
- One Claim Agent
- Deny-by-default capability permissions
- Human approval for public agent output
- Rate-limited automation
- Visible trust/context cues
- Provenance records and Content Passport contract semantics
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
11. Human social relationships do not silently grant agent permissions, Space roles, or governance authority.

## Governance evolution direction

Intellectro will continue strengthening these controls through **pattern transfer without authority transfer**. Governance lessons from DGAF and other NDR projects may inform Intellectro, but they do not transfer authorization, evidence, scientific results, or verification state.

For consequential AI activity, the target path is:

`request → typed capability → policy decision → approval/verifier when required → execution → durable receipt → challenge/correction`

Before broader autonomous authority is released, Intellectro should independently establish versioned policy, adversarial tests, provenance/decision receipt behavior, rollback or revocation behavior, runtime evidence, and an explicit release decision. Higher-impact actions should prefer separation between the component proposing an action and the authority validating it when practical.

See [`ADR 0004 — Pattern transfer without authority transfer`](docs/adr/0004-pattern-transfer-without-authority-transfer.md).

## Core loop

`connect → Space → discuss → inspect → coordinate → produce outcome`

MVP proving path:

`Human connects with collaborator → joins shared Space → posts a source-linked claim → Claim Agent analyzes it → another human challenges or qualifies the claim → Community Agent summarizes the disagreement → moderator approves the summary → provenance and action records are preserved`

## Repository layout

```text
apps/
  web/                  Next.js demo + authenticated persisted-alpha surface
agents/
  claim-agent/          bounded evidence-assistant contract
  community-agent/      bounded community-governance contract
packages/
  governance/           capability, approval, rate-limit, and audit primitives
  provenance/           provenance + revision-aware Content Passport contracts
  social-core/          social objects, relationship lifecycle, chronological feed, trust context
supabase/               versioned schema and RLS migrations
governance/             machine-readable policy/schema artifacts
docs/                   product, architecture, evaluation, threat models, verification plans, and ADRs
.github/workflows/       automated verification
```

## Documentation map

- [`docs/product-thesis.md`](docs/product-thesis.md) — canonical positioning, user problem, differentiation, and anti-goals
- [`docs/architecture.md`](docs/architecture.md) — layers, graphs, boundaries, capability-release progression, and data responsibilities
- [`docs/governance-kernel.md`](docs/governance-kernel.md) — principals, capabilities, controls, invariants, audit events, and rate limits
- [`docs/governance-ux.md`](docs/governance-ux.md) — trust states, contextual disclosure, challenge flows, and progressive inspection
- [`docs/agents.md`](docs/agents.md) — agent roles, permissions, prohibitions, and sequencing
- [`docs/evaluation.md`](docs/evaluation.md) — alpha evaluation plan and Contextual Trust Comprehension metric
- [`docs/mvp-roadmap.md`](docs/mvp-roadmap.md) — phased MVP backlog and evidence state
- [`docs/alpha-completion-gates.md`](docs/alpha-completion-gates.md) — repository/runtime/product/evaluation completion predicates
- [`docs/threat-model-social-slice.md`](docs/threat-model-social-slice.md) — vertical-slice threats, controls, and required live evidence
- [`docs/supabase-live-verification.md`](docs/supabase-live-verification.md) — live database/RLS and browser auth/session verification gates
- [`docs/research-context.md`](docs/research-context.md) — competitive/research context with evidence-status cautions
- [`docs/history/strategic-evolution.md`](docs/history/strategic-evolution.md) — why the thesis moved from agent-native to governance-native
- [`governance/capability-matrix.yaml`](governance/capability-matrix.yaml) — machine-readable initial policy
- [`governance/action-event.schema.json`](governance/action-event.schema.json) — minimum audit-event shape
- [`docs/adr/`](docs/adr/) — frozen architecture decisions, including the DGAF-informed pattern-transfer boundary

## Architecture principle

> **Governance kernel first. Social Space immediately. Autonomous agency later, if earned by evidence.**

GitHub is the source of truth for code, schemas, policies, migrations, tests, agent contracts, evaluation assets, and architecture decisions. Vercel owns deployment/runtime facts and the dedicated Intellectro Supabase project owns live database/Auth facts. Live social content and private user data belong in the runtime datastore, not in this repository.