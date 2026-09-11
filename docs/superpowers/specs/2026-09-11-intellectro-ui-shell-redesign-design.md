# Intellectro UI Shell Redesign — Design Specification

Date: 2026-09-11  
Status: Approved direction; implementation pending written-spec review  
Base source identity: `36d1d2fbb1ea3540df20865c7a83994b0f865a04`  
Scope: presentation, information architecture, responsive behavior, accessibility, and interaction hierarchy only

## 1. Purpose

Intellectro already has a coherent dark visual language and a strong governance/provenance substrate, but the current UI gives internal system-state explanations nearly the same visual priority as social interaction. The redesign should make the application feel like a polished collaboration network first while preserving the ability to inspect authority, provenance, approval, disagreement, and correction state whenever those details matter.

The target experience is a dark editorial collaboration product rather than a governance dashboard.

Core principle:

> Ordinary use should feel like people working together. Governance should feel like confidence, not paperwork.

This redesign does not weaken, hide, or reinterpret the underlying governance model. It changes how that model is progressively disclosed.

## 2. Non-goals and invariants

This work must not:

- add autonomous agent authority;
- change capability, approval, RLS, correction, or provenance semantics;
- convert human connection state into Space role, moderator authority, or agent authority;
- claim Browser Gate B, production persistence, or runtime verification;
- implement real search while visually pretending that search already exists;
- introduce ranking/recommendation behavior;
- remove access to provenance, approval, action-log, or correction information when that information is relevant.

The existing fail-closed runtime behavior remains authoritative.

## 3. Product hierarchy

The visible product hierarchy becomes:

1. People and identity
2. Spaces and discussion
3. Collaboration and outcomes
4. Agent assistance
5. Context and accountability
6. Governance detail on demand

This means a normal feed should primarily answer:

- who is speaking;
- what they said;
- whether AI materially participated;
- whether the item has evidence or unresolved review state;
- what social/collaboration actions are available.

It should not require users to parse policy-version, capability, approval, provenance, and correction mechanics on every post.

## 4. Desktop application shell

### 4.1 Left navigation

Use a persistent left rail for currently implemented first-class product destinations:

- Home
- Spaces
- People
- Review, shown only when the user has review/moderation work
- Account/Profile entry point

Below the primary destinations, show a compact list of the user's Spaces.

Projects and Personal Agent are future destinations and must not appear as functional navigation until those product objects actually exist. Navigation is a claim about available capability and must remain truthful.

Do not place alpha-boundary explanations in the main navigation. A small system-status/about surface may remain available elsewhere.

### 4.2 Center column

The center column owns the active task:

- compact Space/page header;
- composer or task-specific primary action;
- chronological discussion/collaboration stream;
- page-local empty/error states.

The current large authenticated Space hero should become a compact header. Marketing/demo pages may retain a larger hero.

### 4.3 Right contextual rail

The right rail becomes contextual rather than permanently instructional. Depending on the current view or selection it may show:

- selected post context;
- sources;
- collaborators;
- Space metadata;
- pending review work;
- lightweight governance state.

It must not permanently repeat "how to read Intellectro" instructions once a user is inside the product.

## 5. Mobile application shell

At mobile widths the current design hides the left rail entirely, which removes navigation. Replace that behavior with:

- compact top bar containing brand/current Space and context trigger;
- full-width primary content;
- bottom navigation for implemented destinations: Home · Spaces · People · You;
- add Review to the mobile navigation only when the user has applicable review work;
- add Agent later only when a real Personal Agent surface exists;
- contextual sheets for Space switching, provenance, review details, and secondary actions.

Projects can appear under Home/Spaces until the product has enough project volume to justify a dedicated destination.

No implemented primary destination may disappear solely because viewport width is small.

## 6. Top bar and navigation affordances

The current non-interactive element styled as "Search people, Spaces, sources, and projects" is misleading. Until real search exists:

- do not render it as an editable-looking search field;
- replace it with a neutral current-context title or clearly non-search navigation control;
- when real search is implemented later, use an actual input/dialog trigger with keyboard and screen-reader semantics.

Account/sign-out state remains explicit and accessible.

## 7. Visual system

### 7.1 Color

Move structural surfaces from green-tinted panels toward graphite/charcoal neutrals.

Reserve semantic accents:

- emerald: primary Intellectro interaction/positive state;
- violet: AI involvement;
- blue: source/evidence linkage;
- amber: unresolved, pending, or review-required state;
- red: destructive, failed, denied, or dangerous actions only.

The UI must not use color as the only carrier of meaning.

### 7.2 Typography

Keep the existing system sans-serif stack for implementation simplicity.

Hierarchy target:

- page title: approximately 30–34px desktop authenticated views;
- section title: 18–22px;
- post body: 16–17px with generous line height;
- metadata: 12–13px;
- eyebrow labels: use sparingly; avoid making every section look administrative.

### 7.3 Surfaces

Reduce the number of heavily bordered boxes. Use spacing and grouping before adding another card border.

Primary feed cards may retain subtle boundaries. Nested governance/context controls should generally use dividers, sheets, or quiet tonal backgrounds rather than card-inside-card stacking.

## 8. Post-card redesign

The post is the core social object. Default hierarchy:

1. author/avatar/role/time;
2. post content;
3. exceptional trust/evidence state;
4. social/contextual actions;
5. expandable or sheet-based context.

### 8.1 Default trust state

Do not show "Human-authored" as a badge on every ordinary human post. Human authorship is the baseline when the author row already identifies a person.

Show chips only for meaningful exceptions or useful context, for example:

- AI summarized
- AI extracted claims
- 3 sources
- Approval required
- Human approved
- Challenged
- Inputs changed

### 8.2 Context detail

Replace the visually heavy per-post inline context block with a context trigger that opens a side sheet on desktop and bottom sheet on mobile.

The detailed context may include:

- creator;
- AI assistance type;
- human approval status;
- source list/count;
- Content Passport/currentness when available;
- community disagreement state;
- action-log entry point;
- correction/appeal entry point.

The disclosure "provenance describes origin/transformation; it does not certify truth" remains available in this detailed context, but does not need to occupy permanent space on every card.

## 9. Context and governance disclosure model

Use three presentation levels.

### Level 0 — normal reading

No governance explanation unless an exceptional state exists.

### Level 1 — lightweight signal

Compact chips/icons for AI involvement, evidence, pending review, challenge, or staleness.

### Level 2 — inspectable detail

Context sheet/drawer with provenance, approval, capability/action history, correction history, and relevant policy explanation.

Consequential or blocked actions may bypass progressive disclosure and show explicit warnings when necessary.

## 10. Authenticated information architecture

The current persisted `/app` page contains too many independent workflows in one scroll. Split presentation responsibility while reusing the same authoritative data/actions.

### Home

- current/recent Space feed;
- composer;
- useful collaboration activity;
- no profile editor or relationship-management bulk UI.

### Spaces

- user's Spaces;
- discover/join/create controls;
- Space settings where authorized;
- later Space invitations.

### People

- connections;
- incoming/outgoing requests;
- discoverable profiles;
- connect/disconnect/block/mute entry points.

### Projects

Do not render a Projects destination until real project/research objects exist. Current collaboration remains organized through Spaces and discussion.

### Agent

Do not render a Personal Agent destination until a real Personal Agent exists. The current Community/Claim Agent governance surfaces remain available where they are relevant to Space/review context; they do not imply a personal assistant.

### Review

Visible only to users with pending moderator/reviewer responsibilities. Contains agent approval requests, reports/corrections, and related governed review work.

### Profile/Account

Profile editing and sign-out belong under the user's account surface rather than in the primary feed.

## 11. Demo/landing experience

The demo landing page should demonstrate the product without reading like documentation.

Keep:

- one strong Space example;
- a small number of representative posts;
- exceptional AI/source/disagreement states;
- explicit demo-mode labeling.

Reduce:

- persistent "Alpha boundaries" list in the primary navigation;
- permanent "How to read Intellectro" tutorial card;
- governance metrics that compete with social content.

A single compact "Why Intellectro is different" or "Trust context" explainer is sufficient for the demo.

The demo must continue to state that it does not represent authenticated sessions, persisted approvals, or live provenance records.

## 12. Empty, loading, error, and denied states

Every first-class view must have an intentional state for:

- no data yet;
- loading/pending server action where applicable;
- permission denied;
- stale or changed source inputs;
- fail-closed runtime configuration;
- network/database error without privileged retry.

Language should be concise and action-oriented. Technical governance terminology belongs in expanded details unless it is necessary to explain why an action is unavailable.

## 13. Accessibility

Required behaviors:

- visible `:focus-visible` treatment retained or improved;
- interactive controls must be real buttons/links/inputs, never styled non-interactive divs;
- minimum practical 44px mobile touch target for primary controls;
- semantic headings remain ordered;
- sheets/drawers require focus management, accessible names, escape/close behavior, and focus restoration;
- chips cannot rely on color alone;
- pending/denied/error states use text plus semantic roles where appropriate;
- mobile bottom navigation exposes current destination via `aria-current`.

## 14. Responsive breakpoints

The implementation may retain existing breakpoints initially, but behavior changes:

- desktop: left nav + center + contextual right rail;
- medium/tablet: compact left nav + center; context opens as sheet;
- mobile: center content + top context control + bottom nav.

The right rail may disappear at smaller widths only if its content remains reachable through the context sheet.

## 15. Component boundaries

Prefer focused components rather than expanding the already-large authenticated page.

Expected reusable presentation units include:

- `AppShell`
- `PrimaryNav`
- `MobileNav`
- `SpaceHeader`
- `ContextDrawer`
- `TrustSignals`
- redesigned `PostCard`
- `PeoplePanel` / People view
- `ReviewPanel` / Review view
- compact account/profile control

These components receive already-authoritative state/actions. They must not manufacture authenticated identity, approval state, agent capability, or provenance state.

Do not create a second data/governance layer in the UI.

## 16. Implementation strategy

Implement in one dedicated UI PR after this spec is approved, using incremental RED→GREEN tests.

Recommended order:

1. shell/navigation contract;
2. responsive/mobile navigation contract;
3. feed and compact Space header;
4. post/trust-signal hierarchy;
5. context drawer/sheet;
6. relocate People/profile/review presentation;
7. demo landing simplification;
8. accessibility regression checks;
9. truth-layer/documentation reconciliation;
10. exact-head CI and build verification.

No database migration should be required for this UI PR.

## 17. Test strategy

Add or update tests that mechanically protect:

- only implemented primary destinations are exposed;
- Review visibility is role/work gated;
- no fake search-input affordance exists before search is implemented;
- human-authored baseline is not rendered as a mandatory repetitive badge;
- exceptional AI/source/pending/disputed states remain visible;
- full context remains reachable;
- mobile navigation remains available when desktop rail is hidden;
- People presentation preserves connection ≠ authority wording;
- no UI component accepts user-supplied actor/approval identity where server-derived identity is required;
- fail-closed runtime states still render correctly;
- production build succeeds.

Existing governance/domain tests remain authoritative and must not be weakened merely to accommodate the redesign.

## 18. Success criteria

The redesign succeeds when:

- the feed reads first as social/collaborative content rather than governance documentation;
- a user can identify where they are and move among the real product areas without hunting through disclosure panels;
- exceptional AI/evidence/review states are easier to notice than today;
- detailed authority/provenance information remains one deliberate interaction away;
- mobile navigation does not disappear;
- the authenticated app no longer presents unrelated account, connection, Space-management, review, and feed workflows as one undifferentiated scroll;
- no governance or authority boundary changes as a side effect of presentation work.

## 19. Deferred work

Not part of this redesign:

- real search;
- recommendation/ranking;
- Personal Agent implementation;
- new project/task domain objects;
- Space invitation backend;
- Content Passport persistence/UI beyond any already-supported state;
- animations beyond small interaction transitions;
- visual branding/logo overhaul.

Those features should land on the new shell after the shell itself is verified.
