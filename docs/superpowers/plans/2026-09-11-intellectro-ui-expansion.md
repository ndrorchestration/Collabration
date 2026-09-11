# Intellectro UI Expansion — Governed Social Shell, Phase 1

**Goal:** make the demo-mode shell feel like a real governed social space and add the first missing surface (comments) plus a richer demo-mode demonstration of the governance primitives, targeting a PR against `main`.

**Authority:** user approved "all of that." This is Phase 1 of that scope, scoped to stay coherent in one PR; Phase 2 surfaces are flagged, not built here.

**Constraints (from repo + social-slice plan):**
- Chronological feed only; no ranking model.
- Demo mode never impersonates authenticated state or claims persistence.
- Trust chips / provenance language: provenance records origin and transformation, not truth.
- Support / challenge / qualify are contextual responses, not truth votes.
- No autonomous public posting.
- Supabase secrets are never required for build or CI.
- Accessibility: respect `prefers-reduced-motion`.

---

## In scope (this PR)

### 1. Visual polish (design language preserved)
**Files:** `apps/web/app/globals.css`, `apps/web/app/page.js` (tiny stagger change)

- Staggered post-card entrance (`feed-in` keyframe, `opacity 0 → 1`, `translateY(8px) → 0`, 400ms ease-out, `animation-delay` per card via inline style from map index). `prefers-reduced-motion` guard disables motion.
- Trust chip hover/active states (`trust-chip:hover` lift + border accent; per-tone hover color).
- Context panel polish: summary hover cue, `details[open]` border warmth, cleaner definition list spacing.
- Composer card: focus-within highlight, secondary-button hover lift.
- Space hero: primary-button hover lift + subtle hero gradient shift on hover.
- Response bar: active-response button state, "Add evidence" affordance hover.
- Side-card / rail polish: hover cue on metric rows, read-list spacing.

### 2. Comments surface (schema-ready, demo-mode)
**Files:** `apps/web/components/comment-thread.js` (new), `apps/web/components/post-card.js` (wire in), `apps/web/lib/demo-data.js` (add demo comments)

- New `CommentThread` component:
  - Renders demo comments (author avatar + display name + handle + timestamp + body).
  - Collapsible section below the post's context panel.
  - Comment composer: textarea + submit; demo mode adds to local state (setState), structured for Supabase wiring later.
  - Demo note: "Demo comments are not persisted."
- Wire `CommentThread` into `PostCard` so every post can show a comment thread.
- Keep governance disclosure progressive: comment → lightweight response cues where relevant.

### 3. Richer demo-mode trust-state demonstration
**Files:** `apps/web/lib/demo-data.js`

- Add to the demo feed:
  - A **disputed** source-linked post (challenges > 0 → dispute chip + context panel shows dispute state).
  - An **AI-assisted** post awaiting human approval (`humanApproved: false` → chip + "Required before publication" in context panel).
  - A **multi-source** post (2 sources → "Source-linked · 2").
- Keep the existing posts; the feed now visibly demonstrates the governance primitives the alpha claims.

### 4. Demo-mode affordance
**Files:** `apps/web/app/page.js` (small), `apps/web/app/globals.css` (small)

- Make the demo boundaries honest in-shell: ensure the "Demo mode" entry point and the per-interaction demo notes are visible and consistent.
- Keep "No autonomous public posting" / "Human approval for agent output" / "Deny-by-default capabilities" boundary list intact and visible in the left rail.

---

## Out of scope (Phase 2, separate PR — flagged, not built here)

- Reactions (like / useful / interesting) — schema present, UI/persistence pending.
- Profiles — real profile surface + avatar popover.
- Source-linking UI — add / view sources on a post.
- Persisted challenge / qualify — `claim_responses` table wiring.
- Moderator review queue — `agent_actions` + `approval_records` review surface.
- Action-log viewer — the "Inspect action log" affordance.

---

## Verification gates

- `npm run check` passes (JS syntax).
- `npm run build:web` produces a Next.js production build without Supabase secrets.
- Demo mode renders the enriched feed + comments without errors.
- No fabricated authenticated session; no claim that demo interactions are persisted.
- Trust-chip / provenance language unchanged: provenance = origin/transformation, not truth.

---

## Notes

- `packages/social-core/src/index.js` already exports `createSocialPost`, `createClaimResponse`, `chronologicalFeed`, `deriveTrustContext`. The UI already consumes `deriveTrustContext` from `post-card.js`; the main Phase-1 trust work is making the demo data showcase all states, not re-plumbing the function.
- The Supabase migration `supabase/migrations/20260911030000_social_vertical_slice.sql` already has `comments`, `claim_responses`, `reactions`, `profiles`, `sources`, `post_sources`, `agent_actions`, `approval_records`, `reports`, `blocks`, `mutes` with RLS. Phase-1 components are structured to be wired to these later; none fabricate persistence.
