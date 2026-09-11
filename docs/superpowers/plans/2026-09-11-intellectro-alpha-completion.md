# Intellectro Alpha Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the repository-controlled Intellectro alpha surface and leave only explicitly external runtime/evaluation gates open.

**Architecture:** Extend the existing Next.js + Supabase vertical slice rather than creating a second control plane. Human social-safety writes remain RLS-bound; governed agent/audit writes use narrow authenticated RPCs with server-derived identity and machine-checked capability bindings; inspection surfaces are read-only projections of policy/evidence.

**Tech Stack:** Node.js >=22, Next.js 16, React 19, Supabase SSR/Postgres/RLS, ESM, `node:test`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-11-intellectro-alpha-completion-design.md`

## Global Constraints

- Default governance decision remains `deny`.
- Autonomous public posting, banning, deletion, policy change, and self-escalation remain denied.
- No ordinary browser INSERT policy on `agent_actions` or `provenance_records`.
- Actor/owner/approver identity comes from authenticated claims / `auth.uid()`.
- Provenance is not truth.
- No ranking model or deferred-platform scope enters this plan.
- Model-provider execution is optional/server-only and must fail closed when unconfigured.
- Live browser Gate B and user evaluation are separate evidence gates.

---

### Task 1: Reconcile Current State and Completion Controls

**Files:**
- Modify: `README.md`
- Modify: `docs/mvp-roadmap.md`
- Modify: `docs/supabase-live-verification.md`
- Create: `docs/alpha-completion-gates.md`
- Test: `tests/documentation-state.test.js`

**Interfaces:**
- Consumes: live evidence already recorded in `docs/evidence/supabase-live-verification-2026-09-11.md`.
- Produces: one fail-closed alpha completion matrix referenced by later tasks.

- [ ] Write `tests/documentation-state.test.js` asserting current docs no longer claim that the dedicated Supabase project/migrations are absent and that Gate B remains NOT VERIFIED.
- [ ] Commit the RED test and confirm exact-head CI fails for the stale README/roadmap wording.
- [ ] Reconcile README/roadmap and add `docs/alpha-completion-gates.md` with Repository, Runtime, Product-loop, Evaluation, Security, and Operations predicates.
- [ ] Run full repository tests/CI and confirm GREEN.
- [ ] Commit the documentation reconciliation.

### Task 2: Social Safety Paths

**Files:**
- Modify: `apps/web/app/app/actions.js`
- Modify: `apps/web/app/app/page.js`
- Create: `supabase/migrations/20260911050000_social_safety_hardening.sql`
- Test: `tests/social-safety-boundary.test.js`

**Interfaces:**
- Consumes: tables `reactions`, `reports`, `blocks`, `mutes`; authenticated claim helper.
- Produces: `setReaction`, `reportPost`, `blockMember`, `unblockMember`, `muteMember`, `unmuteMember`; RLS membership/target constraints.

- [ ] Write RED tests requiring server-derived actor IDs, supported reactions/reasons, no self-block/mute, and feed filtering hooks.
- [ ] Confirm RED failure on exact branch head.
- [ ] Implement minimal authenticated server actions and DB hardening needed by the tests.
- [ ] Render reaction/report controls plus block/mute controls for other visible members; exclude blocked/muted authors from the rendered feed without mutating historical records.
- [ ] Run all tests/build GREEN and commit.

### Task 3: Governance Permission Inspector and Action Log

**Files:**
- Create: `packages/governance/src/inspection.js`
- Modify: `packages/governance/src/index.js`
- Modify: `apps/web/app/app/page.js`
- Test: `tests/governance-inspection.test.js`

**Interfaces:**
- Consumes: canonical capability matrix semantics and live `agent_actions` / `approval_records` reads.
- Produces: `buildPermissionInspection(agentType)` returning explicit `allow`, `approval_required`, `deny` classifications without execution claims.

- [ ] Write RED tests for Community/Claim capability visibility and default-deny treatment of unknown capabilities.
- [ ] Verify RED.
- [ ] Implement the smallest pure inspection projection and authenticated UI rendering.
- [ ] Add action-log read view limited by existing RLS.
- [ ] Verify full tests/build GREEN and commit.

### Task 4: Governed Pending-Action and Approval Lifecycle

**Files:**
- Create: `supabase/migrations/20260911052000_governed_action_lifecycle.sql`
- Modify: `apps/web/app/app/actions.js`
- Modify: `apps/web/app/app/page.js`
- Test: `tests/governed-action-lifecycle.test.js`

**Interfaces:**
- Consumes: policy version `0.1.0-alpha`, `agent_actions`, `approval_records`, Space moderator relation.
- Produces: RPC `request_governed_agent_action(...)`; RPC `decide_governed_agent_action(...)`; moderator review queue.

- [ ] Write RED structural tests requiring RPCs to derive `auth.uid()`, reject unknown agent/capability pairs, require `approval_required` public-draft capabilities, and forbid anonymous execution.
- [ ] Verify RED.
- [ ] Implement RPCs with empty `search_path`, explicit grants to `authenticated` only, immutable action identity, and one-way pending → approved/rejected state transition.
- [ ] Route application actions through the RPCs; remove any direct approval insert path that can diverge from action state.
- [ ] Render pending moderator queue and decision history.
- [ ] Verify full tests/build GREEN and commit.

### Task 5: Trusted Provenance Receipt Boundary

**Files:**
- Create: `supabase/migrations/20260911054000_provenance_receipt_boundary.sql`
- Modify: `apps/web/app/app/actions.js`
- Test: `tests/provenance-receipt-boundary.test.js`

**Interfaces:**
- Consumes: approved governed action, optional resulting post, exact transformation metadata.
- Produces: RPC `record_approved_action_provenance(...)` callable only for an approved action the caller owns or moderates, with no truth/confidence field.

- [ ] Write RED tests for approved-action prerequisite, actor relationship, anonymous denial, and prohibition of truth/confidence semantics.
- [ ] Verify RED.
- [ ] Implement the narrow RPC without adding a generic authenticated INSERT policy.
- [ ] Add server action for recording a receipt after a separately executed/approved artifact exists.
- [ ] Verify GREEN and commit.

### Task 6: Correction / Appeal Path

**Files:**
- Create: `supabase/migrations/20260911056000_correction_appeal.sql`
- Modify: `apps/web/app/app/actions.js`
- Modify: `apps/web/app/app/page.js`
- Test: `tests/correction-appeal.test.js`

**Interfaces:**
- Produces: correction request attached to a post or governed action, human author/requester identity, status `open|accepted|rejected|resolved`, moderator resolution where scoped.

- [ ] Write RED tests for requester identity, target exclusivity, moderator-scoped resolution, and immutable original-content history.
- [ ] Verify RED.
- [ ] Implement schema/RLS/server actions/UI with no silent original-content rewrite.
- [ ] Verify GREEN and commit.

### Task 7: Adversarial Alpha Verification Pack

**Files:**
- Create: `tests/alpha-adversarial.test.js`
- Modify: `docs/threat-model-social-slice.md`
- Modify: `docs/alpha-completion-gates.md`

**Interfaces:**
- Consumes all alpha-boundary contracts.
- Produces regression coverage for unsafe redirect, actor forgery, cross-Space moderation, self-escalation, direct audit/provenance writes, replayed approval transitions, malformed capability identity, and block/mute semantics.

- [ ] Add RED tests for any uncovered invariant.
- [ ] Repair only demonstrated gaps.
- [ ] Run `npm run check`, `npm run validate:governance`, `npm test`, and `npm run build:web` through CI.
- [ ] Record exact-head repository verdict; commit.

### Task 8: Operational Controls and External Gates

**Files:**
- Modify: `docs/alpha-completion-gates.md`
- Modify: `docs/supabase-live-verification.md`
- Modify: `docs/evaluation.md`

**Interfaces:**
- External inputs: Vercel public Supabase env, Supabase Auth Site URL/redirect configuration, GitHub branch protection/ruleset, real browser test account, human study participants.
- Produces: explicit blocker/evidence checklist; no inferred PASS.

- [ ] Attempt supported repository-setting/runtime configuration mutations through connected control planes.
- [ ] If a mutation is unavailable, record a GitHub issue with exact setting/value/evidence requirement rather than marking it complete.
- [ ] After Vercel/Supabase Auth config exists, require `/api/health` `persistence=configured` and execute Gate B.
- [ ] Protect `main` with required CI if supported; otherwise keep the issue open.
- [ ] Run the Contextual Trust Comprehension alpha instrument and record results before Evaluation PASS.
- [ ] Do not mark Alpha Complete until Repository + Runtime + Product-loop + Security + Operations + Evaluation are all PASS.
