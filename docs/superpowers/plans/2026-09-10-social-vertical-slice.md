# Social Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Intellectro's first usable social vertical slice around the verified governance kernel: one Space, chronological posts, source-linked claims, contextual trust cues, governed responses, and Supabase-ready persistence/auth wiring.

**Architecture:** Keep social rules in a dependency-light `packages/social-core` module so governance semantics are testable without the UI. Add a Next.js application under `apps/web` that renders the same object model and defaults to deterministic demo data when Supabase environment variables are absent. Add Supabase migrations and RLS as versioned infrastructure, while preserving deny-by-default agent authority and human approval requirements.

**Tech Stack:** Node.js 20+; ECMAScript modules; Node `node:test`; Next.js 16.3.4; React 19.2.8; Supabase JS 2.116.0; `@supabase/ssr` 0.12.7; PostgreSQL/Supabase RLS; GitHub Actions.

**Spec:** `docs/product-thesis.md`, `docs/architecture.md`, `docs/governance-ux.md`, `docs/mvp-roadmap.md`, and ADRs 0001–0003.

## Global Constraints

- Chronological feed only; no engagement ranking.
- Human expression remains lightweight; deeper governance appears for source-linked, AI-assisted, disputed, or moderated objects.
- Provenance records origin/transformation, not truth.
- `support`, `challenge`, and `qualify` are contextual responses, not truth votes.
- Public agent output remains human-approval-gated.
- Supabase credentials are never required for CI or static build verification.
- RLS is enabled on user/community/content tables before live persistence is considered ready.
- No autonomous public posting, agent marketplace, federation, advertising, or broad personal-agent automation.

---

### Task 1: Social object model and feed rules

**Files:**
- Create: `packages/social-core/package.json`
- Create: `packages/social-core/src/index.js`
- Test: `packages/social-core/test/social-core.test.js`

**Interfaces:**
- `createSocialPost(input) -> frozen post`
- `createClaimResponse(input) -> frozen response`
- `chronologicalFeed(posts) -> newest-first frozen array`
- `deriveTrustContext(post) -> typed trust summary`

- [ ] Write failing tests for source requirements, allowed response types, chronological ordering, and trust-context derivation.
- [ ] Run the social-core tests and verify RED because the module does not exist.
- [ ] Implement the minimum model required by the tests.
- [ ] Run the full suite and verify GREEN.

### Task 2: Supabase schema and fail-closed RLS

**Files:**
- Create: `supabase/migrations/20260911030000_social_vertical_slice.sql`
- Create: `tests/supabase-schema.test.js`
- Create: `.env.example`

**Interfaces:**
- Tables: `profiles`, `spaces`, `space_memberships`, `posts`, `comments`, `claim_responses`, `sources`, `post_sources`, `provenance_records`, `agent_actions`, `approval_records`, `reports`, `blocks`, `mutes`.
- RLS: enabled on all runtime tables, with owner/member-scoped policies and no anonymous mutation policy.

- [ ] Write structural tests that fail until all required tables and RLS statements exist.
- [ ] Add one forward-only migration with indexes, constraints, and RLS.
- [ ] Run the full suite and verify GREEN.

### Task 3: Next.js social shell and governance UX

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.mjs`
- Create: `apps/web/app/layout.js`
- Create: `apps/web/app/page.js`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/components/trust-chip.js`
- Create: `apps/web/components/post-card.js`
- Create: `apps/web/lib/demo-data.js`

**Interfaces:**
- The root page renders one Space, chronological demo feed, source-linked/AI-assisted/disputed trust chips, contextual challenge controls, and an inspectable context panel.
- Demo mode never impersonates authenticated state or claims persistence.

- [ ] Add component/data files that consume the same social-object terminology as `social-core`.
- [ ] Keep governance disclosure progressive: chip → concise context → action-log affordance.
- [ ] Build successfully without Supabase environment variables.

### Task 4: Supabase-ready authentication boundary

**Files:**
- Create: `apps/web/lib/supabase/client.js`
- Create: `apps/web/lib/supabase/server.js`
- Create: `apps/web/lib/supabase/env.js`
- Create: `apps/web/app/login/page.js`
- Create: `apps/web/components/login-form.js`

**Interfaces:**
- Browser and server client helpers use current `@supabase/ssr` conventions.
- Login is visibly disabled in demo mode rather than failing or fabricating a session.
- Config uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` only.

- [ ] Add environment validation and lazy client construction.
- [ ] Add an OTP login surface that activates only when Supabase is configured.
- [ ] Verify the production build still passes with no secrets.

### Task 5: CI, documentation, and roadmap truthfulness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md`
- Modify: `docs/mvp-roadmap.md`
- Create: `docs/threat-model-social-slice.md`

**Interfaces:**
- `npm test` verifies domain/governance/schema invariants.
- `npm run check` checks JS syntax.
- `npm run build:web` performs a production Next.js build.

- [ ] Extend workspaces to `apps/*` and add web build scripts.
- [ ] Update CI to build the app on Node 20 and run governance/domain tests on Node 20/22.
- [ ] Mark only genuinely implemented roadmap items complete.
- [ ] Document trust, identity, RLS, challenge misuse, and approval-boundary threats.
- [ ] Run fresh install, checks, tests, and web build before opening the PR.
