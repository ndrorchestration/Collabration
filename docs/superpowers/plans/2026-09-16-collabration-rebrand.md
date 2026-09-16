# Collabration Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the active Intellectro product identity with Collabration across source, runtime-visible copy, package namespaces, active documentation, tests, and ecosystem records while preserving historical provenance and existing evidence boundaries.

**Architecture:** Treat naming as a canonical identity contract rather than a blind global search-and-replace. Active product/runtime surfaces move to Collabration and `@collabration/*`; immutable historical evidence retains Intellectro with an alias where needed. External provider slugs that cannot be atomically renamed remain explicitly classified as historical operational identifiers until provider-level migration is possible.

**Tech Stack:** Next.js, npm workspaces, Node.js tests, Supabase/Postgres, Vercel, GitHub, Notion, Google Drive.

**Spec:** `docs/brand/collabration-identity.md`

## Global Constraints

- Canonical product name: `Collabration`.
- Canonical machine identifier where needed: `collabration`.
- Canonical npm scope: `@collabration/*`.
- Historical alias: `Intellectro`.
- Brand language: `Metacollaborate. Metacalibrate. Metacelebrate.`
- Do not change or imply changes to runtime, authorization, security, evaluation, scientific, verification, deployment, or production-readiness state.
- Do not rewrite historical evidence in ways that falsify chronology.
- Existing external provider IDs/slugs remain aliases until provider-level rename is actually verified.

---

### Task 1: Rename active package identity

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `apps/web/package.json`
- Modify: `packages/social-core/package.json`
- Modify: `packages/governance/package.json`
- Modify: `packages/provenance/package.json`
- Modify: `agents/community-agent/package.json`
- Modify: `agents/claim-agent/package.json`
- Modify imports/config that reference `@intellectro/*`.

- [ ] Replace active npm package scope `@intellectro/*` with `@collabration/*`.
- [ ] Update workspace dependencies and imports consistently.
- [ ] Update lockfile workspace names without changing dependency versions.
- [ ] Verify no active source import still targets `@intellectro/*`.

### Task 2: Rename runtime-visible product surfaces

**Files:**
- Modify: `apps/web/app/layout.js`
- Modify: `apps/web/app/page.js`
- Modify: `apps/web/app/login/page.js`
- Modify any active UI component containing the former product name.

- [ ] Replace visible current-brand references with Collabration.
- [ ] Add the canonical brand line where it improves the landing/product identity without changing state claims.
- [ ] Preserve fail-closed/runtime wording and existing authorization boundaries.

### Task 3: Update active documentation and add migration boundary

**Files:**
- Modify: `README.md`
- Modify: `SECURITY.md`
- Modify: `CONTRIBUTING.md`
- Modify: `docs/architecture.md`
- Modify: `docs/product-thesis.md`
- Modify: `docs/mvp-roadmap.md`
- Modify: `docs/research-context.md`
- Create/retain: `docs/brand/collabration-identity.md`

- [ ] Make Collabration canonical in current documentation.
- [ ] Add one explicit `formerly Intellectro` migration note rather than repeating the alias throughout.
- [ ] Preserve exact provider project IDs, deployment IDs, commit SHAs, and old URLs when they are evidence.
- [ ] Leave dated historical specs/evidence records unchanged unless an active identifier would break execution.

### Task 4: Bind the rename with tests

**Files:**
- Modify or create a repository branding contract test under `tests/`.
- Modify existing tests that assert the old package namespace or current product copy.

- [ ] Assert canonical package names use `@collabration/*`.
- [ ] Assert current UI metadata contains `Collabration`.
- [ ] Assert active application source does not import `@intellectro/*`.
- [ ] Permit historical references only in explicitly historical/evidence/spec locations.

### Task 5: Reconcile open operational records

**Surfaces:**
- GitHub open issues and PR descriptions.
- Notion Operational Control Center, Portfolio Registry, Repository Scope record, naming TODO, Architecture Decision Registry, ecosystem current overlays.
- Google Drive current mirrors/overlays.

- [ ] Rename current records to Collabration while preserving historical provider/repository identifiers until those providers are actually renamed.
- [ ] Record `Intellectro` as historical alias.
- [ ] Mark the naming-decision TODO resolved/implemented, with provider-level renames still separately pending where unsupported.
- [ ] Do not rewrite append-only historical timeline entries; append a dated rename event instead.

### Task 6: Verify and hand off provider-level aliases

**External identifiers currently known:**
- GitHub repository: `ndrorchestration/Intellectro`.
- Supabase project ref: `hibesaapldkvgkydvbds`, provider display name `Intellectro`.
- Vercel project: `intellectro`, project ID `prj_XL2aoUw00ifVjiIxFyZWJCSyyxJN`.

- [ ] Verify repository CI on the exact rename head.
- [ ] Verify build/test/package-resolution behavior.
- [ ] Open a merge-ready PR rather than changing protected `main` directly.
- [ ] Explicitly report any provider-level rename that the connected management API cannot perform; do not claim completion until independently verified.
