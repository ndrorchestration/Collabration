# Intellectro UI Shell Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Intellectro’s web presentation into a social-first, responsive application shell while preserving all existing governance, identity, RLS, provenance, correction, and fail-closed runtime semantics.

**Architecture:** Keep `apps/web/app/app/page.js` as the authoritative server-side data-loading/composition boundary and keep `apps/web/app/app/actions.js` unchanged unless a presentation-only redirect/revalidation adjustment is required. Move presentation responsibilities into focused components (`AppShell`, navigation, People, Review, account, trust signals, context drawer) that receive already-authoritative state and actions as props. Use `?view=home|spaces|people|review|account` plus the existing `space` query parameter rather than inventing new backend routes or capabilities.

**Tech Stack:** Next.js 16.3.4 App Router, React 19.2.8, server components/actions, native HTML `<dialog>` for inspectable context, CSS in `apps/web/app/globals.css`, Node `node:test` static contract tests, existing Supabase/RLS boundary.

**Spec:** `docs/superpowers/specs/2026-09-11-intellectro-ui-shell-redesign-design.md`

## Global Constraints

- Add no autonomous agent authority.
- Change no capability, approval, RLS, correction, provenance, or database semantics.
- Human connection state must never become Space role, moderator authority, or agent authority.
- Browser Gate B, production persistence, and runtime verification remain unestablished.
- Do not render a fake search field, Projects destination, or Personal Agent destination.
- Add no recommendation/ranking behavior.
- Detailed provenance, approval, action-log, and correction information must remain reachable.
- Add no new npm dependency and no Supabase migration.
- Keep configured identity server-derived from `claims.sub`; reusable UI components must not manufacture actor/approval identity or import `demoStore`.
- Existing governance/domain tests remain authoritative and must not be weakened to make the redesign pass.

---

## File Structure

**Create**
- `apps/web/components/app-shell.js` — desktop/mobile shell slots only.
- `apps/web/components/primary-nav.js` — truthful desktop navigation and Space shortcuts.
- `apps/web/components/mobile-nav.js` — implemented mobile destinations with `aria-current`.
- `apps/web/components/space-header.js` — compact authenticated Space header.
- `apps/web/components/trust-signals.js` — exceptional-state trust/evidence chips.
- `apps/web/components/context-drawer.js` — native-dialog provenance/governance detail surface.
- `apps/web/components/people-panel.js` — connection-management presentation only.
- `apps/web/components/review-panel.js` — moderator/reviewer presentation only.
- `apps/web/components/account-panel.js` — profile editing/account boundary presentation only.
- `apps/web/components/spaces-panel.js` — existing create/join/list Space presentation.
- `tests/ui-shell.test.js` — navigation/shell truth-state contracts.
- `tests/ui-trust-presentation.test.js` — progressive-disclosure and post-card contracts.
- `tests/ui-accessibility.test.js` — mobile/dialog/interactive-semantic contracts.

**Modify**
- `apps/web/app/app/page.js` — retain data loading, derive `view`, compose focused panels.
- `apps/web/app/page.js` — simplify demo landing hierarchy.
- `apps/web/components/post-card.js` — social-first hierarchy and context trigger.
- `apps/web/components/demo-governance-rail.js` — replace permanent governance dashboard with one compact explainer.
- `apps/web/app/globals.css` — graphite structural palette, shell, responsive nav, dialog/sheet, reduced card nesting.
- `tests/relationship-ui.test.js` — keep authoritative data-loading assertions on page, move presentation assertions to `PeoplePanel`.
- `tests/ui-adapter-boundary.test.js` — include new reusable components in anti-demo-authority checks.
- `README.md` and/or `docs/mvp-roadmap.md` only if repository truth wording becomes stale after the presentation move.

---

### Task 1: Establish the shell/navigation contract

**Files:**
- Create: `tests/ui-shell.test.js`
- Create: `apps/web/components/app-shell.js`
- Create: `apps/web/components/primary-nav.js`
- Create: `apps/web/components/mobile-nav.js`
- Modify: `apps/web/app/globals.css`

**Interfaces:**
- `AppShell({ topbar, primaryNav, mobileNav, context, children })` renders structural slots only.
- `PrimaryNav({ activeView, spaces, activeSpaceId, canReview })` renders Home, Spaces, People, conditional Review, Account, then Space shortcuts.
- `MobileNav({ activeView, canReview })` renders Home, Spaces, People, conditional Review, You.
- Both navigation components link to `/app?view=<name>` and preserve no fake Projects/Agent/Search destination.

- [ ] **Step 1: Write failing shell tests**

```js
// tests/ui-shell.test.js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('shell exposes only implemented destinations and role-gates Review', () => {
  const nav = read('apps/web/components/primary-nav.js');
  assert.match(nav, /Home/);
  assert.match(nav, /Spaces/);
  assert.match(nav, /People/);
  assert.match(nav, /canReview[\s\S]*Review/);
  assert.match(nav, /Account/);
  assert.doesNotMatch(nav, />Projects</);
  assert.doesNotMatch(nav, />Agent</);
});

test('mobile navigation preserves implemented destinations', () => {
  const nav = read('apps/web/components/mobile-nav.js');
  assert.match(nav, /aria-current/);
  assert.match(nav, /Home/);
  assert.match(nav, /Spaces/);
  assert.match(nav, /People/);
  assert.match(nav, /You/);
});

test('shell does not pretend a non-interactive search control exists', () => {
  const shell = read('apps/web/components/app-shell.js');
  assert.doesNotMatch(shell, /topbar-search/);
  assert.doesNotMatch(shell, /Search people, Spaces, sources, and projects/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/ui-shell.test.js`

Expected: FAIL because the new component files do not exist.

- [ ] **Step 3: Implement the minimal shell**

`primary-nav.js` must use real `Link` elements and gate Review:

```js
import Link from 'next/link';

const items = [
  ['home', 'Home'],
  ['spaces', 'Spaces'],
  ['people', 'People']
];

export function PrimaryNav({ activeView, spaces = [], activeSpaceId = null, canReview = false }) {
  const visibleItems = canReview ? [...items, ['review', 'Review']] : items;
  return (
    <nav className="primary-nav" aria-label="Primary">
      {visibleItems.map(([view, label]) => (
        <Link key={view} href={`/app?view=${view}`} aria-current={activeView === view ? 'page' : undefined}>{label}</Link>
      ))}
      <Link href="/app?view=account" aria-current={activeView === 'account' ? 'page' : undefined}>Account</Link>
      <div className="nav-divider" />
      <p className="nav-section-label">Your Spaces</p>
      {spaces.map((space) => (
        <Link key={space.id} href={`/app?view=home&space=${space.id}`} aria-current={space.id === activeSpaceId && activeView === 'home' ? 'page' : undefined}>{space.name}</Link>
      ))}
    </nav>
  );
}
```

`mobile-nav.js` follows the same truth-state list and uses `aria-current="page"` only for the selected destination.

`app-shell.js` owns structure, not data/authority:

```js
export function AppShell({ topbar, primaryNav, mobileNav, context = null, children }) {
  return (
    <main className="product-shell">
      <header className="product-topbar">{topbar}</header>
      <aside className="product-sidebar">{primaryNav}</aside>
      <section className="product-main">{children}</section>
      <aside className="product-context">{context}</aside>
      {mobileNav}
    </main>
  );
}
```

- [ ] **Step 4: Run GREEN and build**

Run:
```bash
node --test tests/ui-shell.test.js
npm run build:web
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/ui-shell.test.js apps/web/components/app-shell.js apps/web/components/primary-nav.js apps/web/components/mobile-nav.js apps/web/app/globals.css
git commit -m "feat: add truthful responsive product shell"
```

---

### Task 2: Add compact authenticated Space header and view routing

**Files:**
- Create: `apps/web/components/space-header.js`
- Modify: `apps/web/app/app/page.js`
- Modify: `tests/ui-shell.test.js`

**Interfaces:**
- `SpaceHeader({ space, membershipRole })` renders compact title/description/role metadata.
- `page.js` accepts `view` from `searchParams`, normalizes it to `home|spaces|people|review|account`, and forces unauthorized/non-review `review` requests back to `home` presentation without adding authority.

- [ ] **Step 1: Extend RED tests**

```js
test('authenticated page derives a bounded presentation view and uses compact SpaceHeader', () => {
  const page = read('apps/web/app/app/page.js');
  assert.match(page, /const requestedView/);
  assert.match(page, /home.*spaces.*people.*review.*account/s);
  assert.match(page, /<SpaceHeader/);
  assert.doesNotMatch(page, /<section className="space-hero">/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/ui-shell.test.js`

Expected: FAIL because `page.js` still uses the monolithic hero/scroll presentation.

- [ ] **Step 3: Implement view normalization without changing data authority**

Use a closed set:

```js
const APP_VIEWS = new Set(['home', 'spaces', 'people', 'review', 'account']);
const requestedView = typeof params?.view === 'string' ? params.view : 'home';
const normalizedView = APP_VIEWS.has(requestedView) ? requestedView : 'home';
const activeView = normalizedView === 'review' && !canModerate ? 'home' : normalizedView;
```

Do not move the existing Supabase queries or server-derived `userId` out of `page.js` in this task.

- [ ] **Step 4: Run GREEN plus boundary regression**

Run:
```bash
node --test tests/ui-shell.test.js tests/persisted-alpha-boundary.test.js tests/ui-adapter-boundary.test.js
npm run build:web
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/space-header.js apps/web/app/app/page.js tests/ui-shell.test.js
git commit -m "refactor: compose authenticated views through product shell"
```

---

### Task 3: Move People and Account presentation out of the feed

**Files:**
- Create: `apps/web/components/people-panel.js`
- Create: `apps/web/components/account-panel.js`
- Modify: `apps/web/app/app/page.js`
- Modify: `tests/relationship-ui.test.js`
- Modify: `tests/ui-adapter-boundary.test.js`

**Interfaces:**
- `PeoplePanel` receives `acceptedConnections`, `incomingConnectionRequests`, `outgoingConnectionRequests`, `discoverablePeople`, `peopleMap`, `userId`, and existing server actions as props.
- `AccountPanel` receives `profile` and `upsertProfile` only.
- Neither component imports Supabase, `demoStore`, or derives actor identity.

- [ ] **Step 1: Rewrite relationship presentation assertions to target `PeoplePanel` while preserving data assertions on `page.js`**

```js
const page = readFileSync(new URL('../apps/web/app/app/page.js', import.meta.url), 'utf8');
const people = readFileSync(new URL('../apps/web/components/people-panel.js', import.meta.url), 'utf8');

// Existing page query assertions stay on `page`.
assert.match(people, /Connections are human social relationships/i);
assert.match(people, /do not grant agent permissions, Space roles, or governance authority/i);
assert.doesNotMatch(people, /name="(?:requester_id|recipient_id|actor_id)"/);
assert.match(people, /action=\{requestConnection\}/);
assert.match(people, /action=\{decideConnectionRequest\}/);
assert.match(people, /action=\{disconnectConnection\}/);
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/relationship-ui.test.js tests/ui-adapter-boundary.test.js`

Expected: FAIL because the new panels do not exist.

- [ ] **Step 3: Extract only presentation markup**

Move the current connection/profile forms verbatim enough to preserve hidden field names and action bindings. `page.js` must continue deriving all arrays/maps and `userId` from authenticated data.

Add the new components to the reusable-component anti-demo list in `tests/ui-adapter-boundary.test.js`.

- [ ] **Step 4: Run GREEN**

Run:
```bash
node --test tests/relationship-ui.test.js tests/ui-adapter-boundary.test.js tests/persisted-alpha-boundary.test.js
npm run build:web
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/people-panel.js apps/web/components/account-panel.js apps/web/app/app/page.js tests/relationship-ui.test.js tests/ui-adapter-boundary.test.js
git commit -m "refactor: separate People and account presentation"
```

---

### Task 4: Separate Spaces and Review presentation

**Files:**
- Create: `apps/web/components/spaces-panel.js`
- Create: `apps/web/components/review-panel.js`
- Modify: `apps/web/app/app/page.js`
- Modify: `tests/ui-shell.test.js`
- Modify: `tests/governance-queue-visibility.test.js` only if its source-path assertion must follow moved markup; do not change queue semantics.

**Interfaces:**
- `SpacesPanel` receives memberships/spaces and existing `createSpace`/`joinSpace` actions.
- `ReviewPanel` receives `pendingActions`, `openCorrections`, `agentActions`, `permissionInspections`, plus existing review actions. It is rendered only when `canModerate` is true.

- [ ] **Step 1: Add RED assertions**

```js
test('review presentation is separated and never rendered for non-review users', () => {
  const page = read('apps/web/app/app/page.js');
  const review = read('apps/web/components/review-panel.js');
  assert.match(page, /canModerate[\s\S]*<ReviewPanel/);
  assert.match(review, /pendingActions/);
  assert.match(review, /openCorrections/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/ui-shell.test.js tests/governance-queue-visibility.test.js`

- [ ] **Step 3: Extract presentation; keep complete uncapped queue queries in `page.js`**

Do not move or cap the existing separate pending-action query. `ReviewPanel` is a rendering boundary only.

- [ ] **Step 4: Run GREEN plus governance regressions**

Run:
```bash
node --test tests/ui-shell.test.js tests/governance-queue-visibility.test.js tests/governed-action-lifecycle.test.js tests/correction-appeal.test.js
npm run build:web
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/spaces-panel.js apps/web/components/review-panel.js apps/web/app/app/page.js tests/ui-shell.test.js tests/governance-queue-visibility.test.js
git commit -m "refactor: separate Space and review workflows"
```

---

### Task 5: Replace repetitive trust badges with exceptional-state signals

**Files:**
- Create: `apps/web/components/trust-signals.js`
- Create: `tests/ui-trust-presentation.test.js`
- Modify: `apps/web/components/post-card.js`
- Modify: `tests/ui-adapter-boundary.test.js`

**Interfaces:**
- `TrustSignals({ trust, pendingAgentOutput })` returns chips only for source count, AI involvement, human approval when AI participated, pending approval, and community dispute/currentness states available in current data.
- Ordinary human authorship is conveyed by the author row, not a mandatory chip.

- [ ] **Step 1: Write RED tests**

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('ordinary human authorship is not repeated as a mandatory trust chip', () => {
  const post = read('apps/web/components/post-card.js');
  assert.doesNotMatch(post, /<TrustChip tone="human">Human-authored<\/TrustChip>/);
});

test('exceptional AI evidence and review states remain visible', () => {
  const signals = read('apps/web/components/trust-signals.js');
  assert.match(signals, /sourceCount/);
  assert.match(signals, /aiAssisted/);
  assert.match(signals, /Human approved/);
  assert.match(signals, /Awaiting approval/);
  assert.match(signals, /disputed/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/ui-trust-presentation.test.js`

- [ ] **Step 3: Implement `TrustSignals` and replace the inline trust-row logic**

Reuse the existing `assistanceLabel` vocabulary exactly (`AI summarized`, `AI extracted claims`, etc.). Do not introduce a truth/verified badge.

- [ ] **Step 4: Run GREEN and existing truth tests**

Run:
```bash
node --test tests/ui-trust-presentation.test.js tests/ui-adapter-boundary.test.js tests/alpha-adversarial.test.js
npm run build:web
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/trust-signals.js apps/web/components/post-card.js tests/ui-trust-presentation.test.js tests/ui-adapter-boundary.test.js
git commit -m "refactor: foreground exceptional trust signals"
```

---

### Task 6: Move detailed context into an accessible native dialog

**Files:**
- Create: `apps/web/components/context-drawer.js`
- Create: `tests/ui-accessibility.test.js`
- Modify: `apps/web/components/post-card.js`
- Modify: `apps/web/app/globals.css`
- Modify: `tests/ui-adapter-boundary.test.js`

**Interfaces:**
- `ContextDrawer({ label, children })` is a client component using native `<dialog>`.
- Trigger is a real `<button>` with `aria-haspopup="dialog"`.
- `showModal()` opens; close button and native Escape close; browser-native dialog focus behavior is retained; after `close`, focus is explicitly restored to the trigger ref.
- `PostCard` passes current creator/AI/approval/evidence/community/action-log detail as drawer children.

- [ ] **Step 1: Write RED accessibility/source contracts**

```js
test('context detail uses an accessible dialog and restores trigger focus', () => {
  const drawer = read('apps/web/components/context-drawer.js');
  assert.match(drawer, /<dialog/);
  assert.match(drawer, /aria-haspopup="dialog"/);
  assert.match(drawer, /showModal\(\)/);
  assert.match(drawer, /triggerRef\.current\?\.focus\(\)/);
  assert.match(drawer, /type="button"/);
});

test('post detail no longer expands a permanent inline details block', () => {
  const post = read('apps/web/components/post-card.js');
  assert.doesNotMatch(post, /<details className="context-panel">/);
  assert.match(post, /<ContextDrawer/);
  assert.match(post, /Provenance describes origin and transformation/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/ui-accessibility.test.js tests/ui-trust-presentation.test.js`

- [ ] **Step 3: Implement dialog**

Core client behavior:

```js
'use client';
import { useRef } from 'react';

export function ContextDrawer({ label = 'View context', children }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const close = () => dialogRef.current?.close();
  return <>
    <button ref={triggerRef} type="button" className="context-trigger" aria-haspopup="dialog" onClick={() => dialogRef.current?.showModal()}>{label}</button>
    <dialog ref={dialogRef} className="context-drawer" aria-label={label} onClose={() => triggerRef.current?.focus()}>
      <button type="button" className="context-drawer__close" onClick={close} aria-label="Close context">Close</button>
      {children}
    </dialog>
  </>;
}
```

- [ ] **Step 4: Run GREEN/build**

Run:
```bash
node --test tests/ui-accessibility.test.js tests/ui-trust-presentation.test.js tests/ui-adapter-boundary.test.js
npm run build:web
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/context-drawer.js apps/web/components/post-card.js apps/web/app/globals.css tests/ui-accessibility.test.js tests/ui-trust-presentation.test.js tests/ui-adapter-boundary.test.js
git commit -m "feat: add accessible inspectable context drawer"
```

---

### Task 7: Apply the graphite visual hierarchy and responsive/mobile behavior

**Files:**
- Modify: `apps/web/app/globals.css`
- Modify: `tests/ui-accessibility.test.js`
- Modify: `tests/ui-shell.test.js`

**Interfaces:**
- Desktop `>=1051px`: sidebar + center + contextual rail.
- Tablet `761–1050px`: compact sidebar + center; persistent context rail hidden, drawer remains available.
- Mobile `<=760px`: center content + topbar + fixed bottom navigation; desktop sidebar hidden only because mobile nav is present.

- [ ] **Step 1: Add RED CSS contracts**

```js
test('mobile keeps navigation when desktop sidebar is hidden', () => {
  const css = read('apps/web/app/globals.css');
  assert.match(css, /\.mobile-nav/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.product-sidebar[\s\S]*display: none/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.mobile-nav[\s\S]*display:/);
  assert.match(css, /min-height: 44px/);
});

test('structural palette uses neutral surfaces and semantic accents', () => {
  const css = read('apps/web/app/globals.css');
  assert.match(css, /--surface:/);
  assert.match(css, /--ai:/);
  assert.match(css, /--source:/);
  assert.match(css, /--warn:/);
  assert.match(css, /--danger:/);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/ui-shell.test.js tests/ui-accessibility.test.js`

- [ ] **Step 3: Refactor CSS without changing component semantics**

Use neutral structural tokens such as:

```css
:root {
  --bg: #090b0c;
  --surface: #111416;
  --surface-raised: #171b1d;
  --line: #262c2f;
  --text: #eef2f1;
  --muted: #98a3a0;
  --accent: #70e0b1;
  --ai: #c2a4ff;
  --source: #85b9ff;
  --warn: #ffc978;
  --danger: #ff9f9f;
}
```

Primary mobile nav controls must have `min-height: 44px`. Keep visible `:focus-visible` outlines.

- [ ] **Step 4: Run GREEN/build**

Run:
```bash
node --test tests/ui-shell.test.js tests/ui-accessibility.test.js
npm run build:web
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/globals.css tests/ui-shell.test.js tests/ui-accessibility.test.js
git commit -m "style: refine social-first responsive visual system"
```

---

### Task 8: Simplify demo landing and reconcile truth-state documentation

**Files:**
- Modify: `apps/web/app/page.js`
- Modify: `apps/web/components/demo-governance-rail.js`
- Modify: `tests/ui-shell.test.js`
- Modify: `tests/documentation-state.test.js` only if canonical wording genuinely changes.
- Modify: `README.md` / `docs/mvp-roadmap.md` only where needed to state that the redesign is repository-implemented; do not change runtime evidence.

**Interfaces:**
- Demo remains explicitly illustrative and non-persisted.
- Demo keeps representative source/AI/disagreement state but removes permanent Alpha-boundaries and How-to-read tutorial clutter.
- Production/runtime evidence remains unchanged.

- [ ] **Step 1: Add RED demo assertions**

```js
test('demo foregrounds product content instead of permanent governance instructions', () => {
  const page = read('apps/web/app/page.js');
  const rail = read('apps/web/components/demo-governance-rail.js');
  assert.doesNotMatch(page, /Alpha boundaries/);
  assert.doesNotMatch(rail, /How to read Intellectro/);
  assert.match(page, /illustrative/i);
  assert.match(page, /authenticated session|authenticated/i);
  assert.match(page, /persisted provenance|persisted/i);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests/ui-shell.test.js tests/documentation-state.test.js`

- [ ] **Step 3: Simplify demo and reconcile docs**

Keep one compact trust explainer, not a metrics dashboard. Do not alter `/api/health`, production-preflight, or runtime-mode claims.

- [ ] **Step 4: Run the complete verification wave**

Run:
```bash
npm run check
npm run validate:governance
npm test
npm run build:web
```

Expected: all PASS.

Also inspect changed files and confirm there are no changes under:
- `supabase/migrations/`
- `packages/governance/`
- `apps/web/app/app/actions.js` unless the only change is presentation navigation/revalidation and it is separately justified.
- `package.json` / lockfile.

- [ ] **Step 5: Commit final reconciliation**

```bash
git add apps/web/app/page.js apps/web/components/demo-governance-rail.js tests/ui-shell.test.js tests/documentation-state.test.js README.md docs/mvp-roadmap.md
git commit -m "docs: reconcile social-first UI redesign state"
```

- [ ] **Step 6: Exact-head admission**

Require GitHub Actions on the final exact head to complete successfully for:
- `Node 22 governance and domain tests`
- `Node 24 governance and domain tests`
- `Next.js production build`

Do not merge on focused/local verification alone. After merge, require the separate `main` CI run to complete successfully before recording the redesign as admitted repository truth.

---

## Plan Self-Review Checklist

- Spec sections 1–19 are covered by Tasks 1–8; deferred Projects/Personal Agent/search/invitations remain absent.
- No task creates or changes a database migration.
- No task moves identity derivation out of authenticated `page.js`/server actions.
- Relationship presentation moves, but `relationship-ui.test.js` continues protecting server-derived identity and connection ≠ authority semantics.
- Review UI moves, but complete pending/correction queries remain uncapped and authoritative in `page.js`.
- Progressive disclosure removes repetitive visual chrome but keeps AI/source/pending/disputed states visible and detailed provenance/action/correction context reachable.
- Native `<dialog>` avoids a new dependency and provides an accessible modal primitive; explicit focus restoration is required.
- Mobile navigation replaces, rather than merely hides, the desktop navigation.
- No fake search, Projects, or Personal Agent destination is introduced.
- Full exact-head CI and post-merge CI remain mandatory.
