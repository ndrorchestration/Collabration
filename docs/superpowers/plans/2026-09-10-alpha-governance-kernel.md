# Alpha Governance Kernel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Intellectro's documented governance thesis executable and mechanically testable before social UI or autonomous agent behavior is introduced.

**Architecture:** Use a dependency-light Node.js workspace. `packages/governance` owns capability decisions, rate limiting, and audit-event construction. `packages/provenance` owns provenance validation. `agents/community-agent` and `agents/claim-agent` expose bounded, non-autonomous contract helpers that delegate authorization to the governance package. The first CI workflow runs the built-in Node test runner with no external runtime dependencies.

**Tech Stack:** Node.js 20+; ECMAScript modules; Node built-in `node:test` and `assert`; GitHub Actions.

**Spec:** `docs/governance-kernel.md`, `docs/agents.md`, `docs/evaluation.md`, and ADRs 0001–0003.

## Global Constraints

- Agent capabilities are deny-by-default.
- Every agent must have an accountable owner.
- Agents may request capability escalation but may not grant it to themselves.
- Public autonomous posting remains denied during alpha.
- Every automated action is rate-limited.
- Rate-limit denial emits an audit event.
- Provenance records origin and transformation history; it does not establish truth.
- No external runtime dependency is required for this first executable milestone.

---

### Task 1: Governance capability engine

**Files:**
- Create: `package.json`
- Create: `packages/governance/package.json`
- Create: `packages/governance/src/policy.js`
- Create: `packages/governance/src/index.js`
- Test: `packages/governance/test/policy.test.js`

**Interfaces:**
- Produces: `decideCapability({ principal, capability, policy, approval }) -> { decision, reason, capability, policyVersion }`
- Produces: `validateAgentPrincipal(principal) -> true | throws`

- [ ] Write tests that prove unknown capabilities deny, ownerless agents reject, approval-required actions remain blocked without approval, and self-escalation denies.
- [ ] Run `npm test` and verify RED because implementation modules do not exist.
- [ ] Implement the minimum policy engine to satisfy the tests.
- [ ] Run `npm test` and verify GREEN.
- [ ] Commit as `feat: add deny-by-default governance policy engine`.

### Task 2: Governed rate limiting and action events

**Files:**
- Create: `packages/governance/src/rate-limit.js`
- Create: `packages/governance/src/action-event.js`
- Test: `packages/governance/test/rate-limit.test.js`
- Test: `packages/governance/test/action-event.test.js`

**Interfaces:**
- Produces: `createRateLimiter({ limit, windowMs, now })` with `.check(key)` returning `{ allowed, remaining, resetAt }`.
- Produces: `createActionEvent(input) -> immutable event object`.
- Produces: `assertActionEvent(event) -> true | throws`.

- [ ] Write failing tests for quota enforcement, window reset, rate-limit denial audit events, required attribution fields, and immutable event output.
- [ ] Run the focused tests and verify RED.
- [ ] Implement minimal rate-limit and event functions.
- [ ] Run the full test suite and verify GREEN.
- [ ] Commit as `feat: add governed rate limits and action events`.

### Task 3: Provenance boundary

**Files:**
- Create: `packages/provenance/package.json`
- Create: `packages/provenance/src/index.js`
- Test: `packages/provenance/test/provenance.test.js`

**Interfaces:**
- Produces: `createProvenanceRecord({ sourceObjects, transformations, generatedAt })`.
- Produces: `assertProvenanceRecord(record)`.

- [ ] Write failing tests proving source objects are required, transformations are preserved in order, and truth/confidence claims are not synthesized by provenance validation.
- [ ] Run tests and verify RED.
- [ ] Implement minimal provenance helpers.
- [ ] Run all tests and verify GREEN.
- [ ] Commit as `feat: add provenance record boundary`.

### Task 4: Bounded alpha agent contracts

**Files:**
- Create: `agents/community-agent/package.json`
- Create: `agents/community-agent/src/index.js`
- Create: `agents/claim-agent/package.json`
- Create: `agents/claim-agent/src/index.js`
- Test: `agents/community-agent/test/community-agent.test.js`
- Test: `agents/claim-agent/test/claim-agent.test.js`

**Interfaces:**
- Community Agent: `planCommunityAction({ action, principal, policy, approval })` returns a governance decision and never executes external side effects.
- Claim Agent: `buildClaimAnalysisDraft({ text, sourceIds, principal, policy })` returns a draft envelope with provenance references and `publicationStatus: 'human_approval_required'`.

- [ ] Write failing tests proving Community Agent cannot delete, ban, publish, or change policy and Claim Agent cannot mark its own draft approved.
- [ ] Run focused tests and verify RED.
- [ ] Implement minimal contract helpers only; no LLM calls or external services.
- [ ] Run full suite and verify GREEN.
- [ ] Commit as `feat: add bounded alpha agent contracts`.

### Task 5: CI and repository operating surface

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.gitignore`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Modify: `README.md`

**Interfaces:**
- CI contract: Node 20 and Node 22 must both pass `npm test`.

- [ ] Add CI workflow for tests and syntax checks.
- [ ] Add contributor rules that capability expansion requires an ADR/decision record and tests.
- [ ] Add security reporting guidance and explicit prohibition on committing secrets/user data.
- [ ] Update README with runnable commands and implemented-vs-planned status.
- [ ] Run `npm test` and `node --check` across source files.
- [ ] Commit as `chore: add CI and contribution guardrails`.

### Task 6: Verification and PR

- [ ] Run the entire test suite from a clean local staging directory.
- [ ] Verify every source file parses with Node.
- [ ] Compare the feature branch with `main` and confirm changes are limited to the planned executable foundation.
- [ ] Open a pull request describing invariants proven, deferred scope, and verification evidence.
- [ ] Do not merge until GitHub CI is green.