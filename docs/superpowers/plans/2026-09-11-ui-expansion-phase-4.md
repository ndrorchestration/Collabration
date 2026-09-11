# Intellectro UI Expansion — Phase 4: Reactions + Profiles + Moderator Queue + Action Log

**Goal:** add the remaining alpha surfaces — reactions, author profile hover, moderator review queue, and the trusted action-log viewer — as demo-mode affordances wired to `demoStore`, with honest notes that persistence + real RLS reads come from Supabase (wired in a later pass per the Phase-3 planning doc).

**Repo truth (verify yourself before relying on any cached claim):**
- Repo root: `/c/Users/Admin/OneDrive/Desktop/intellectro-live` (git working tree, node_modules at root, node 24.16.0, npm 11.17.0).
- Apps web package: `apps/web` (name `@intellectro/web`, next 16.3.4, react 19.2.8).
- Build command: `npm run build:web` from repo root (workspace-aware; installs to root node_modules).
- Syntax check: `node --check <file>` from repo root. Workspace check: `npm run check` (runs node --check over packages/ agents/ tests/ apps/).
- Design system: `apps/web/app/globals.css` — dark shell, `--accent #70e0b1`, `--accent-strong #a4f7d1`, `--source #85b9ff`, `--ai #c2a4ff`, `--warn #ffc978`, `--muted #92a7a0`. Use existing class names; do not invent a new design system.
- No new npm packages. React 19 hooks only.
- Each component using useState/hooks must be `'use client'`.
- Build gates: every file must pass `node --check`; the full workspace build `npm run build:web` must complete clean (static routes `/` + `/login`, no pending/chunked errors).
- Do NOT touch `LICENSE`/`NOTICE`/`AXIS`. Do NOT add secrets/credentials anywhere.
- Do NOT rewrite existing files wholesale; make minimal targeted wire-in edits to `post-card.js` (for the action-log trigger + reaction bar + profile hover) and `page.js` (for the moderator queue right-rail card, if page.js still has room; otherwise add it as an extra right-rail card).

**Current on-disk state you must not regress (read these files before editing):**
- `apps/web/app/page.js` — imports `PostCard`, `CommunityStatePanel`, `SourceLinker`, `demoAuthors`, `demoFeed`, `demoSpace`, `hasSupabaseEnv`. Right rail renders `<CommunityStatePanel />` + a `side-card` "How to read Intellectro". Composer card renders avatar + placeholder + `Add source` button + `<SourceLinker />`. Feed maps `demoFeed.map(...)`.
- `apps/web/components/post-card.js` — imports `deriveTrustContext`, `TrustChip`, `ContextResponseBar`, `CommentThread`, `ClaimResponseComposer`, `demoStore`, `demoComments`, `demoAuthors`, `RESPONSE_LABEL_MAP`. The context panel has a stub `<button type="button" className="link-button">Inspect action log</button>`. The response bar renders `<ContextResponseBar />`.
- `apps/web/components/context-response-bar.js` — stub with Support/Challenge/Qualify + Add evidence + demo note.
- `apps/web/lib/demo-store.js` — `demoStore` static + `useDemoStore()`. Has `get()`, `addComment`, `addClaimResponse`, `addReaction`, `toggleReaction`, `getReactionsForPost`, `addSource`, `getSources`, `recordApproval`, `getApprovalsForAction`. `initial.reactions = {}`, `initial.approvals = []`.
- `apps/web/lib/demo-data.js` — `demoSpace`, `demoFeed` (5 posts), `demoAuthors` (ender/maya/jon), `demoComments`.
- `apps/web/lib/response-types.js` — `RESPONSE_TYPES`, `RESPONSE_LABEL_MAP`.

**Real vocabulary you must cite accurately:**
- Reactions (from migration `reactions.reaction` check + social-core has no reaction type set, so the vocabulary comes from the SQL migration): `like`, `useful`, `interesting`.
- Claim response types (from `response-types.js` + migration `claim_responses.response_type`): `support`, `challenge`, `qualify`, `add_evidence`, `ask_question`.
- Agent action approval status (from migration `agent_actions.approval_status` + `action-event.schema.json` + `action-event.js`): `not_required`, `pending`, `approved`, `rejected`.
- Action-event shape (from `action-event.js` + `action-event.schema.json`): `event_type: 'agent_action'`, `action_id`, `actor_id`, `owner_id`, `action`, `scope`, `policy_version`, `capabilities_used` (array, >=1), `approval_status`, `timestamp` ISO; optional `target_id`, `approver_id`, `input_refs`, `output_refs`, `provenance_refs`, `rate_limit_decision`.
- Capability posture (from `capability-matrix.yaml`): `default: deny`; `draft_public_content: approval_required`, `publish_public_content: approval_required`; `delete_content`, `ban_user`, `change_policy`, `create_or_invite_agent`, `grant_capability: deny`; alpha constraints: `autonomous_public_posting: deny`, `autonomous_banning: deny`, `autonomous_deletion: deny`, `autonomous_policy_change: deny`.
- Policy decision vocabulary (from `policy.js`): `decideCapability` returns `{ decision: 'allow' | 'deny' | 'approval_required', reason, capability, policyVersion }`.

**Phase 4 deliverables (write/modify these files):**

### 4.1 — ReactionBar
Write `apps/web/components/reaction-bar.js` — `'use client'`. Props: `{ post, currentUserId }`. Renders three toggle buttons for the allowed reactions `like`, `useful`, `interesting`, each showing its current count from `demoStore.getReactionsForPost(post.id)`. On click, calls `demoStore.toggleReaction(post.id, currentUserId, reaction)`. Imports `demoStore` from `../lib/demo-store`. Use the real reaction vocabulary — do NOT invent new reactions. Render as a compact row in the response-bar area. Add CSS classes `reaction-bar`, `reaction-button`, `reaction-button--active`, `reaction-button__count`; styles in `globals.css`, consistent with the existing design language (muted until active, accent on active).

### 4.2 — ProfileHover
Write `apps/web/components/profile-hover.js` — `'use client'`. Props: `{ author, bio }`. Renders an inline author chip: avatar initial + display name + handle + role + bio (if provided). Use it inline on the post-card author header and in the comment author meta. Add demo bios to `demo-data.js` `demoAuthors` (one short bio per author, 1 sentence, governance-flavored). Do NOT read a real `profiles` table in demo mode — demo bios live in `demo-data.js`. Add CSS classes `profile-hover`, `profile-hover__avatar`, `profile-hover__name`, `profile-hover__handle`, `profile-hover__role`, `profile-hover__bio`; styles in `globals.css`.

Wire `profile-hover.js` into:
- `post-card.js` author header: replace the raw `<div><strong>{author.displayName}</strong><div className="muted">{author.handle} · {author.role}</div></div>` with `<ProfileHover author={author} bio={demoAuthors[author.id]?.bio} />`. Keep the avatar initial somewhere (ProfileHover can render it).
- `comment-thread.js` author meta: import `ProfileHover` and render it in place of the raw author span, passing `bio={demoAuthors[comment.authorId]?.bio}`. If `comment-thread.js` does not import `demoAuthors`, import it from `../lib/demo-data`.

### 4.3 — ModeratorQueue
Write `apps/web/components/moderator-queue.js` — `'use client'`. Renders a right-rail `side-card` titled "Moderator queue" that lists agent outputs awaiting human approval. For demo mode, derive the queue from:
- `demoFeed` posts where `kind === 'ai_assisted'` && `aiAssistance?.humanApproved === false` (these are the pending agent outputs), and
- `demoStore.get().approvals` (recorded approvals, for the "recent decisions" sub-list).

Each pending row shows: agent_id, action text (derive from `aiAssistance.type`, e.g. "community_summary" → "Draft community summary"), policy version placeholder (use the capability-matrix `version: "0.1.0-alpha"`), and Approve / Reject buttons that call `demoStore.recordApproval(actionId, approverId, decision, note)`. Use a demo `currentUserId` (e.g. `user-ender`) for the approver. After approval, the row can move to a "recent decisions" sub-section. Honest note: "In demo mode, approvals are stored in this browser only and do not update a real approval_records table."

Render it in `page.js` right rail as an additional `side-card` below `CommunityStatePanel` (do NOT remove `CommunityStatePanel`). Import `ModeratorQueue` and render `<ModeratorQueue currentUserId="user-ender" />`.

Add CSS classes `moderator-queue`, `moderator-queue__row`, `moderator-queue__agent`, `moderator-queue__action`, `moderator-queue__policy`, `moderator-queue__actions`, `moderator-queue__decision`; styles in `globals.css`.

### 4.4 — ActionLogViewer + wire the existing "Inspect action log" button
Write `apps/web/components/action-log-viewer.js` — `'use client'`. A small expandable panel (or modal; pick expandable panel for simplicity and to match the existing context-panel style) that lists the recent agent actions for the space, drawn from:
- `demoFeed` ai_assisted posts mapped to an action-event-shaped record (use `createActionEvent` from `@intellectro/governance` if available; if not, build the shape inline using the exact vocabulary: `event_type: 'agent_action'`, `action_id`, `actor_id`, `owner_id`, `action`, `scope`, `policy_version`, `capabilities_used`, `approval_status`, `timestamp`). Do NOT fabricate capabilities — use a plausible small array like `['summarize_space']` for the community summary post, `['extract_claims']` for the claim-extraction post, consistent with `capability-matrix.yaml`.
- `demoStore.get().approvals` mapped to approval records (action_id, approver_id, decision, note, created_at).

The panel opens when the user clicks the existing "Inspect action log" button in `post-card.js` context panel. For this phase, the button triggers the viewer for the whole space (not post-specific — that's fine for alpha; a future pass can scope it). Pass a `open` state from the page or from post-card; simplest correct choice: lift an `openActionLog` state into `page.js` and pass `onOpenActionLog` to `PostCard`, which calls it on the button click; `ActionLogViewer` renders in the right rail or as an overlay when `open` is true. Pick ONE approach and implement it cleanly — do not build both.

Honest note in the viewer: "In demo mode, the action log is drawn from the local demo feed and browser-only approvals. Connect Supabase to read the real `agent_actions` and `approval_records` tables (owner-scoped via RLS)."

Wire the existing stub button in `post-card.js`:
- Import `ActionLogViewer`? No — the viewer renders in page.js. PostCard gets an `onOpenActionLog` prop and calls it on the button click. Replace the `<button type="button" className="link-button">Inspect action log</button>` with `<button type="button" className="link-button" onClick={onOpenActionLog}>Inspect action log</button>`.
- `page.js` lifts `const [actionLogOpen, setActionLogOpen] = useState(false)`, passes `onOpenActionLog={() => setActionLogOpen(true)}` to each `PostCard`, and renders `<ActionLogViewer open={actionLogOpen} onClose={() => setActionLogOpen(false)} />` in the right rail (below `ModeratorQueue`).

Add CSS classes `action-log-viewer`, `action-log-viewer__row`, `action-log-viewer__agent`, `action-log-viewer__action`, `action-log-viewer__status`, `action-log-viewer__policy`, `action-log-viewer__refs`, `action-log-viewer__close`; styles in `globals.css`.

**Constraints for every file:**
- No new npm packages.
- No secrets.
- Build must stay green: `node --check` on every file + `npm run build:web` clean.
- Minimal targeted wire-in edits to `post-card.js` (Props: add `onOpenActionLog`; replace the stub button; add `ProfileHover` import + usage; import `demoAuthors`), `comment-thread.js` (import `ProfileHover` + `demoAuthors`; use it in author meta), and `page.js` (import `ModeratorQueue`, `ActionLogViewer`; lift `actionLogOpen` state; pass `onOpenActionLog`; render both cards). Do NOT rewrite these files wholesale.
- `demo-data.js` gets demo bios added to `demoAuthors` (one short sentence each).

**Output:** a short report listing every file written/modified, line counts, the build result (clean / failure + what failed).
