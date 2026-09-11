# Post-PR #9 UI Semantic Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transplant the useful Phase 1–4 UX from PR #8 onto the accepted governed/persisted-alpha base from PR #9 without allowing demo state, client synthesis, or older UI assumptions to weaken the accepted authority, persistence, provenance, correction, or queue semantics.

**Architecture:** Accepted `main` commit `fd1c5c56e7c01165358538d00bb64440ccf8ecf9` is the authority/persistence base. PR #8 head `294572930f1afd2678cf8879b4c24c4501a9956b` is a source of validated UI behaviors, not an authority source. UI components must receive explicit demo or live adapters; configured/authenticated paths use server-derived identity and the PR #9 Supabase/RLS/server-action path, while intentionally selected local demo mode may use clearly labelled browser-local state. Production missing or malformed persistence configuration fails closed and must never activate demo authority.

**Tech Stack:** Next.js 16.3.4, React, Node.js 22/24, Supabase SSR/Postgres/RLS, workspace packages `@intellectro/governance`, `@intellectro/social-core`, repository Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-11-intellectro-alpha-completion-design.md`; architectural boundary: `docs/adr/0004-pattern-transfer-without-authority-transfer.md`.

## Global Constraints

- Accepted governed base: `fd1c5c56e7c01165358538d00bb64440ccf8ecf9`; do not reinterpret PR #8 as authority over newer PR #9 controls.
- Preserve deny-by-default agent capabilities and the explicit prohibition on autonomous public posting.
- Preserve the accepted governed-action lifecycle, provenance receipt boundary, correction/appeal history, and uncapped governance queue semantics.
- Production must fail closed when Supabase public runtime configuration is absent or malformed; it must not silently activate demo mode.
- Demo state must remain visibly labelled and must never represent an authenticated user, persisted approval, authoritative provenance record, or live governed action.
- Configured mode derives identity from validated server-side claims and routes writes through the existing server actions/RLS/RPC boundaries.
- No new external package is required for this integration unless separately reviewed.
- Preserve Node 22 and Node 24 governance/domain verification plus the Next.js production build.
- Provenance establishes origin/transformation history, not truth.
- DGAF patterns may inform design only; DGAF authorization, verification, experimental, or scientific state does not transfer.

---

## Source inventory and semantic ownership

### Accepted PR #9 / `main` ownership

- `apps/web/app/app/page.js` — authenticated persisted application surface and direct governance queues.
- `apps/web/app/app/actions.js` — authenticated server actions, including reactions, social safety, governed actions, provenance, correction/appeal.
- `apps/web/lib/supabase/*` — runtime auth/session/database clients.
- `packages/governance/*` — canonical policy/capability semantics.
- `supabase/migrations/*` — admitted persisted authorization/data semantics.
- `tests/governance-queue-visibility.test.js` — governance queues may not be derived from capped display history.
- `tests/*adversarial*`, `tests/*boundary*` — fail-closed behavior remains authoritative.

### PR #8 behaviors eligible for transplant

- Visual polish from `apps/web/app/globals.css`.
- `claim-response-composer.js`.
- `comment-thread.js`.
- `community-state-panel.js`.
- `profile-hover.js`.
- `reaction-bar.js` behavior, after correcting per-post/current-user semantics.
- `source-linker.js` presentation, mapped to live server action in configured mode.
- `moderator-queue.js` presentation only; live queue data remains the PR #9 direct governed-action/correction query path.
- `action-log-viewer.js` presentation only; configured mode displays persisted authoritative records, not synthesized demo records.
- `demo-store.js` only behind explicit demo mode.
- `demo-data.js` only as demo fixtures; it overlaps with the accepted branch and must be reconciled semantically.

### Explicit non-transfers from PR #8

- Do not transplant client-synthesized approval/provenance as live state.
- Do not transplant `currentUserId="user-ender"` or any other demo identity into configured/authenticated paths.
- Do not let `hasSupabaseEnv() === false` alone select demo mode in production.
- Do not replace the accepted authenticated `/app` path with a client-only demo shell.

---

### Task 1: Lock runtime-mode semantics with failing tests

**Files:**
- Modify: `tests/deployment-contract.test.js`
- Modify: `apps/web/lib/deployment-contract.js`
- Create: `apps/web/lib/runtime-mode.js`
- Create: `tests/runtime-mode.test.js`

**Interfaces:**
- Produces: `resolveRuntimeMode(env)` returning `{ mode, persistenceConfigured, healthy, reason }`.
- `mode` is one of `demo`, `configured`, `misconfigured`.
- Configured production with missing/partial Supabase config must return `misconfigured`, `healthy: false`.
- Intentional local/demo operation with no config may return `demo`, `healthy: true`.

- [ ] **Step 1: Write failing runtime-mode tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRuntimeMode } from '../apps/web/lib/runtime-mode.js';

test('local development without Supabase config may enter explicit demo mode', () => {
  assert.deepEqual(resolveRuntimeMode({ NODE_ENV: 'development' }), {
    mode: 'demo',
    persistenceConfigured: false,
    healthy: true,
    reason: 'local_demo'
  });
});

test('production without Supabase config fails closed', () => {
  const result = resolveRuntimeMode({ NODE_ENV: 'production', VERCEL_ENV: 'production' });
  assert.equal(result.mode, 'misconfigured');
  assert.equal(result.persistenceConfigured, false);
  assert.equal(result.healthy, false);
  assert.equal(result.reason, 'production_persistence_missing');
});

test('partial Supabase config is misconfigured in every mode', () => {
  const result = resolveRuntimeMode({
    NODE_ENV: 'development',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co'
  });
  assert.equal(result.mode, 'misconfigured');
  assert.equal(result.healthy, false);
  assert.equal(result.reason, 'partial_persistence_config');
});

test('complete Supabase config selects configured mode', () => {
  const result = resolveRuntimeMode({
    NODE_ENV: 'production',
    VERCEL_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public-key'
  });
  assert.equal(result.mode, 'configured');
  assert.equal(result.persistenceConfigured, true);
  assert.equal(result.healthy, true);
});
```

- [ ] **Step 2: Run RED verification**

Run: `node --test tests/runtime-mode.test.js`
Expected: FAIL because `apps/web/lib/runtime-mode.js` does not yet exist.

- [ ] **Step 3: Implement `resolveRuntimeMode` minimally**

```js
export function resolveRuntimeMode(env = process.env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
  const hasUrl = Boolean(url);
  const hasKey = Boolean(key);
  const persistenceConfigured = hasUrl && hasKey;

  if (hasUrl !== hasKey) {
    return Object.freeze({
      mode: 'misconfigured',
      persistenceConfigured: false,
      healthy: false,
      reason: 'partial_persistence_config'
    });
  }

  if (persistenceConfigured) {
    return Object.freeze({
      mode: 'configured',
      persistenceConfigured: true,
      healthy: true,
      reason: 'persistence_configured'
    });
  }

  const production = env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production';
  if (production) {
    return Object.freeze({
      mode: 'misconfigured',
      persistenceConfigured: false,
      healthy: false,
      reason: 'production_persistence_missing'
    });
  }

  return Object.freeze({
    mode: 'demo',
    persistenceConfigured: false,
    healthy: true,
    reason: 'local_demo'
  });
}
```

- [ ] **Step 4: Bind the health/deployment contract to runtime mode**

`buildDeploymentContract(env)` must consume `resolveRuntimeMode(env)` and expose:

```js
{
  status: runtime.healthy ? 'ok' : 'misconfigured',
  runtimeMode: runtime.mode,
  persistence: runtime.persistenceConfigured ? 'configured' : 'disabled',
  configurationReason: runtime.reason
}
```

Preserve the existing governance fields exactly.

- [ ] **Step 5: Extend deployment-contract tests**

Add explicit assertions that production missing/partial Supabase config returns a non-OK deployment status and never reports `runtimeMode: 'demo'`.

- [ ] **Step 6: Run GREEN verification**

Run: `node --test tests/runtime-mode.test.js tests/deployment-contract.test.js`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/runtime-mode.js apps/web/lib/deployment-contract.js tests/runtime-mode.test.js tests/deployment-contract.test.js
git commit -m "fix: fail closed on production persistence misconfiguration"
```

---

### Task 2: Correct and constrain demo-store semantics

**Files:**
- Create from PR #8, then modify: `apps/web/lib/demo-store.js`
- Create: `tests/demo-store.test.js`

**Interfaces:**
- `getReactionsForPost(postId)` counts only keys for the supplied post.
- `hasReaction(postId, userId, reaction)` reports current-user state independently of aggregate count.
- Documentation truthfully says localStorage persists browser-local demo state across reloads until cleared.

- [ ] **Step 1: Write RED tests for cross-post isolation and current-user state**

Use a deterministic in-memory localStorage shim assigned to `global.window.localStorage`.

```js
test('reaction counts are isolated by post id', async () => {
  demoStore.toggleReaction('post-a', 'user-a', 'like');
  demoStore.toggleReaction('post-b', 'user-b', 'useful');
  assert.deepEqual(demoStore.getReactionsForPost('post-a'), {
    like: 1,
    useful: 0,
    interesting: 0
  });
});

test('active reaction state belongs to the current user, not aggregate count', async () => {
  demoStore.toggleReaction('post-a', 'user-a', 'like');
  assert.equal(demoStore.hasReaction('post-a', 'user-a', 'like'), true);
  assert.equal(demoStore.hasReaction('post-a', 'user-b', 'like'), false);
});
```

- [ ] **Step 2: Run RED verification**

Run: `node --test tests/demo-store.test.js`
Expected: FAIL because PR #8 aggregation ignores `postId` and `hasReaction` is absent.

- [ ] **Step 3: Correct aggregation and add current-user lookup**

Parse reaction keys as `[storedPostId, storedUserId, storedReaction]`; count only `storedPostId === postId`. Implement `hasReaction` by exact key lookup.

- [ ] **Step 4: Correct the demo-store documentation**

Replace the false “no persistence across reloads” statement with: browser-local demo state uses localStorage and may survive reloads on the same browser profile; it is not server-persisted and must never be interpreted as authenticated/live state.

- [ ] **Step 5: Run GREEN verification**

Run: `node --test tests/demo-store.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/demo-store.js tests/demo-store.test.js
git commit -m "fix: isolate demo reactions and current-user state"
```

---

### Task 3: Introduce explicit UI data-source adapters

**Files:**
- Create: `apps/web/lib/ui-adapters/demo.js`
- Create: `apps/web/lib/ui-adapters/types.js` (JSDoc contracts only; no TypeScript migration)
- Modify: `apps/web/app/page.js`
- Modify: `apps/web/app/app/page.js`

**Interfaces:**

Every reusable social component should receive state/actions through props shaped around these concepts instead of importing `demoStore` directly:

```js
{
  mode: 'demo' | 'configured',
  viewer: { id, displayName } | null,
  reactions: { counts, active },
  comments,
  claimResponses,
  sources,
  governedActions,
  corrections,
  actions: {
    toggleReaction,
    addComment,
    addClaimResponse,
    addSource,
    requestAgentAction,
    decideAgentAction,
    requestCorrection
  }
}
```

- [ ] **Step 1: Add structural tests that reusable components do not import `demo-store` directly**

Create a test that reads transplanted reusable component files and fails on `../lib/demo-store` imports except inside the demo adapter.

- [ ] **Step 2: Run RED verification**

Expected: FAIL after PR #8 components are introduced unchanged.

- [ ] **Step 3: Add the demo adapter**

The adapter is the only module allowed to translate `demoStore` into the reusable UI contract. It must export clearly demo-labelled actor identity and must not expose authenticated semantics.

- [ ] **Step 4: Preserve configured-path authority**

The authenticated `/app` route continues to load persisted data server-side and invoke `apps/web/app/app/actions.js`. Do not introduce a client-side actor/owner/approver identifier for live writes.

- [ ] **Step 5: Run the structural boundary test**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/ui-adapters apps/web/app/page.js apps/web/app/app/page.js tests
git commit -m "refactor: separate demo and configured UI data sources"
```

---

### Task 4: Transplant presentation components without authority synthesis

**Files:**
- Create/adapt: `apps/web/components/reaction-bar.js`
- Create/adapt: `apps/web/components/profile-hover.js`
- Create/adapt: `apps/web/components/comment-thread.js`
- Create/adapt: `apps/web/components/claim-response-composer.js`
- Create/adapt: `apps/web/components/source-linker.js`
- Create/adapt: `apps/web/components/community-state-panel.js`
- Create/adapt: `apps/web/components/moderator-queue.js`
- Create/adapt: `apps/web/components/action-log-viewer.js`
- Modify: `apps/web/components/post-card.js`
- Modify: `apps/web/components/context-response-bar.js`

**Interfaces:**
- Components render state passed by their owning route/adapter.
- `ReactionBar` receives `counts`, `activeReactions`, and `onToggle`; `aria-pressed` is based on current-user state.
- `ModeratorQueue` receives authoritative pending records in configured mode; it may receive explicitly synthetic fixtures only in demo mode.
- `ActionLogViewer` receives persisted action/approval/provenance records in configured mode; it must never synthesize a live approval state from post metadata.

- [ ] **Step 1: Copy PR #8 presentation components as source material**

Do not copy their data ownership assumptions unchanged.

- [ ] **Step 2: Refactor `ReactionBar`**

```jsx
export function ReactionBar({ counts, activeReactions, onToggle }) {
  // aggregate count and current-user state are distinct
}
```

- [ ] **Step 3: Refactor moderator/action-log components**

Remove direct demo-store ownership from reusable components. Demo synthesis, if retained, belongs only in the demo adapter.

- [ ] **Step 4: Preserve accessible state**

Keep semantic buttons, `aria-pressed`, keyboard-reachable inspection, and clear pending/approved/rejected labels.

- [ ] **Step 5: Verify**

Run: `npm run check && npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components apps/web/lib/ui-adapters tests
git commit -m "feat: transplant governed social presentation components"
```

---

### Task 5: Reconcile `demo-data.js` semantically

**Files:**
- Modify: `apps/web/lib/demo-data.js`
- Test: `tests/demo-fixture-contract.test.js`

**Interfaces:**
- Retain accepted `main` fixtures that document current governance semantics.
- Add only PR #8 fixture richness that remains truthful under the accepted policy vocabulary.
- Each AI/governed fixture must distinguish proposal, approval, publication, provenance, dispute, and correction state.

- [ ] **Step 1: Write fixture-contract assertions**

Assert unique IDs, valid author references, recognized trust states, and no fixture that marks pending agent output as published/approved.

- [ ] **Step 2: Compare PR #8 and accepted-main fixtures field-by-field**

Do not choose either entire file wholesale.

- [ ] **Step 3: Merge only coherent PR #8-only examples**

Preserve useful scenarios such as disagreement and source-revision drift if their labels match current governance semantics.

- [ ] **Step 4: Verify**

Run: `node --test tests/demo-fixture-contract.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/demo-data.js tests/demo-fixture-contract.test.js
git commit -m "test: reconcile demo fixtures with governed alpha semantics"
```

---

### Task 6: Transplant visual polish with progressive disclosure

**Files:**
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/page.js`
- Modify: `apps/web/app/app/page.js`

**Interfaces:**
- Preserve three UX layers: lightweight context chip → contextual inspection → technical audit/history.
- Ordinary human posting/reading remains low-friction.
- Governance information becomes more visible only when trust/authority matters.

- [ ] **Step 1: Port PR #8 styles selectively**

Keep layout, hover/focus, composer, comment, reaction, profile, queue, and viewer styling that does not depend on demo-only semantics.

- [ ] **Step 2: Use typed AI verbs in copy**

Prefer `AI summarized`, `AI drafted`, `human approved`, `awaiting approval`, `source linked`, `challenged/corrected` over vague `AI enhanced` language.

- [ ] **Step 3: Preserve fail-closed production copy**

A misconfigured production runtime should render/return an unhealthy configuration state, not “Demo mode.”

- [ ] **Step 4: Build verification**

Run: `npm run build:web`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app apps/web/components
git commit -m "feat: integrate progressive governance UX polish"
```

---

### Task 7: Preserve configured-mode queue and receipt authority

**Files:**
- Modify only if needed: `apps/web/app/app/page.js`
- Modify only if needed: `apps/web/app/app/actions.js`
- Test: `tests/governance-queue-visibility.test.js`
- Test: `tests/alpha-adversarial.test.js`
- Test: `tests/provenance-receipt-boundary.test.js`
- Test: `tests/correction-appeal.test.js`

**Interfaces:**
- Pending governed actions use a direct uncapped pending query.
- Correction/appeal Space resolution uses target relationships, not IDs from capped feed/action-history lists.
- Approval/provenance state in configured mode is sourced from persisted records/RPC outcomes.

- [ ] **Step 1: Run the existing queue/adversarial tests before any live-path edit**

Run:

```bash
node --test \
  tests/governance-queue-visibility.test.js \
  tests/alpha-adversarial.test.js \
  tests/provenance-receipt-boundary.test.js \
  tests/correction-appeal.test.js
```

Expected: PASS on the accepted base.

- [ ] **Step 2: After integration, rerun the exact same tests**

Expected: PASS without weakening assertions.

- [ ] **Step 3: Add a regression if any transplant attempt reintroduces capped-history queue derivation or client-synthesized live authority**

- [ ] **Step 4: Commit only if code/test changes were required**

---

### Task 8: Record the accountable-collaboration product direction without duplicating SSoT

**Files:**
- Modify: `docs/product-thesis.md`
- Modify: `docs/architecture.md`
- Modify: `docs/mvp-roadmap.md`
- Modify: `docs/evaluation.md`

**Interfaces:**
- Product foreground: people, relationships, Spaces, collaboration, outcomes.
- Trust infrastructure: agents, capabilities, provenance, receipts, verification, challenge/correction.
- Personal Agent progression: private read/research/organize/summarize/draft first; consequential shared-state authority later and capability-by-capability.
- Evaluation vector: authorship comprehension, AI-role comprehension, authority comprehension, provenance/truth separation, correction discoverability, governance burden, useful-outcome rate.

- [ ] **Step 1: Update product thesis**

Add the concise positioning:

> Intellectro is where people and their AI teammates work together in communities without making agency invisible.

Keep the product as an accountable collaboration network rather than a generic AI social network or governance dashboard.

- [ ] **Step 2: Update architecture**

Document `Content Passport`, `Action Receipt`, and `Verification Result` as distinct future trust objects; none implies truth/correctness beyond its exact semantics.

- [ ] **Step 3: Update roadmap**

Record dependency order:

`governed base → integrated live alpha → minimal passport/trust substrate + social collaboration in parallel → Personal Agent copilot → governed personal actions → controlled automation`.

- [ ] **Step 4: Update evaluation**

Add controlled stimuli for human-only, AI-drafted/human-approved, awaiting-approval, source-linked false, unsourced true, disputed, corrected, and stale-input summaries.

- [ ] **Step 5: Run documentation-state tests**

Run: `node --test tests/documentation-state.test.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add docs/product-thesis.md docs/architecture.md docs/mvp-roadmap.md docs/evaluation.md tests/documentation-state.test.js
git commit -m "docs: sharpen accountable collaboration product direction"
```

---

### Task 9: Full integrated exact-head verification

**Files:** No intended source changes.

- [ ] **Step 1: Run repository checks**

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm run validate:governance
npm test
npm run build:web
```

Expected: all commands exit 0.

- [ ] **Step 2: Confirm changed-file dependency audit**

Verify no unreviewed external package dependency entered the branch.

- [ ] **Step 3: Confirm secrets audit**

Verify no token/private key/service-role secret is present in committed content.

- [ ] **Step 4: Confirm mode matrix**

Required states:

- local no config → labelled demo mode;
- configured runtime → Supabase/RLS/server identity path;
- partial config → unhealthy/misconfigured;
- production missing config → unhealthy/misconfigured, never demo.

- [ ] **Step 5: Confirm authority invariants**

- no autonomous public posting;
- no client-supplied authoritative actor/owner/approver identity;
- no demo approvals/provenance treated as live;
- no capped display-history governance queue;
- provenance does not imply truth;
- correction history remains append-only;
- agent self-escalation remains denied.

- [ ] **Step 6: Open the integration PR as draft until exact-head CI is terminal green**

PR body must record:

- accepted base SHA `fd1c5c56e7c01165358538d00bb64440ccf8ecf9`;
- PR #8 source SHA `294572930f1afd2678cf8879b4c24c4501a9956b`;
- semantic-transplant strategy;
- `demo-data.js` overlap;
- corrected reaction semantics;
- production fail-closed runtime-mode contract;
- explicit statement that no new autonomous authority is granted.

---

## Self-review

- **Spec coverage:** preserves PR #9 governance/persistence semantics; covers PR #8 UI components, demo store, demo-data overlap, runtime-mode ambiguity, queue regression, docs, build/tests.
- **Known defects addressed:** cross-post reaction aggregation, aggregate-count-as-current-user state, false demo-store reload documentation, production missing-config fallback ambiguity.
- **Authority boundary:** PR #8 contributes presentation behavior only; accepted PR #9 remains authoritative for configured live state.
- **No duplicate subsystem:** extends existing governance/provenance/social/application boundaries rather than creating parallel authority or trust stacks.
- **Evidence discipline:** CI/build evidence will be bound to the final integrated head; live browser/runtime verification remains separate and must not be inferred from repository CI.
