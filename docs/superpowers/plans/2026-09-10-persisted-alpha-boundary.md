# Persisted Alpha Boundary Implementation Plan

> **For agentic workers:** Implement with test-first changes and preserve fail-closed agent authority.

**Goal:** Move Intellectro from a safe demo shell to repository-complete persisted-alpha wiring without applying schema changes to an unrelated Supabase project.

**Architecture:** Keep `/` as an inspectable demo/product surface and add `/app` as the authenticated runtime surface. Supabase SSR uses request-scoped clients, a Next.js proxy that validates claims and propagates refresh cookies/cache headers, and a PKCE callback route. Server actions derive actor identity from validated claims rather than form input. A follow-up migration tightens RLS around Space membership and moderator approval and adds an atomic Space-creation function whose owner is always `auth.uid()`.

**Tech Stack:** Next.js 16; React 19; `@supabase/ssr`; `@supabase/supabase-js`; PostgreSQL/Supabase RLS; Node built-in tests.

**Spec:** `docs/governance-kernel.md`, `docs/governance-ux.md`, `docs/mvp-roadmap.md`, `docs/threat-model-social-slice.md`.

## Global constraints

- Never trust client-supplied author, owner, approver, or user IDs when `auth.uid()` / validated claims can determine identity.
- Server authorization uses `auth.getClaims()`, not an unvalidated session object.
- Auth responses that can refresh cookies must be non-cacheable and preserve Supabase-provided cache headers.
- Ordinary users may post/comment/respond only inside Spaces they have joined.
- Adding a source directly to a post is restricted to the post author; others use contextual `add_evidence` responses.
- Approval records require moderator/admin authority in the action's Space; arbitrary authenticated users cannot approve agent actions.
- No ordinary client insert path is added for `agent_actions` or `provenance_records`.
- No autonomous public agent posting is introduced.
- Database application remains blocked until an isolated Intellectro Supabase project/branch is explicitly approved.

## Tasks

1. Add RED contract tests for SSR claim validation, callback safety, authenticated persistence actions, and RLS hardening.
2. Add request-scoped Supabase proxy/session-refresh boundary and `/auth/callback` PKCE exchange route.
3. Add authenticated `/app` page plus server actions for profile, Space creation/join, posts, comments, and contextual claim responses.
4. Add a follow-up migration that gates social writes by Space membership, restricts post-source mutation, restricts approvals to moderators/admins, and creates an atomic `create_space_with_owner` function deriving ownership from `auth.uid()`.
5. Update login redirect, CI/static contracts, threat model, README, and roadmap truth-state.
6. Run exact-head Node 20/22 tests and Next.js production build before merge. Database/RLS live verification is a separate required gate after an isolated Supabase target exists.
