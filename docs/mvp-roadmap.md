# MVP Roadmap

## Evidence notation

A checked repository item means the implementation exists and is covered by repository verification. It does **not** imply live Supabase behavior has been verified unless explicitly stated. The current live-database state is **NOT VERIFIED** until the isolated-project gate in [`supabase-live-verification.md`](supabase-live-verification.md) passes.

## Phase 0 — Repository and governance foundation

- [x] Define principal/agent identity schema
- [x] Implement deny-by-default capability model
- [x] Add capability matrix validation
- [x] Define action/provenance event schemas
- [x] Implement rate limits for agent registration/actions
- [x] Add permission, attribution, and rate-limit tests
- [x] Threat-model the vertical slice

## Phase 1 — Familiar social Space

- [x] Create application shell
- [x] Add authentication runtime wiring (validated SSR claims, PKCE callback, refresh-cookie proxy; live project verification pending)
- [x] Add profiles (persisted server-action path implemented; live RLS verification pending)
- [x] Add Spaces/membership (atomic owner creation + join path implemented; live RLS verification pending)
- [x] Add posts and comments (human/source-linked post + comment persistence paths implemented; live RLS verification pending)
- [x] Add chronological feed
- [ ] Add basic reactions (schema present; authenticated UI/persistence path pending)
- [ ] Add report, block, and mute (RLS-backed schema present; authenticated UI/persistence paths pending)

## Phase 2 — Governance-native interaction

- [x] Add source-linked post type and atomic persistence path
- [x] Add support / challenge / qualify / add-evidence responses
- [x] Add typed AI-assistance labels
- [x] Add trust/context chips
- [x] Add provenance records (domain + schema; trusted provenance writer still pending)
- [ ] Add permission inspector
- [ ] Add action-log viewer
- [ ] Add correction / appeal flow

## Phase 3 — Bounded agents

- [x] Community Agent in read/summarize/recommend mode
- [x] Claim Agent in evidence-assistant mode
- [ ] Human approval workflow for public agent outputs (kernel + moderator/admin RLS admission policy present; review/execution path pending)
- [ ] Moderator review queue
- [ ] Agent action/audit persistence (schema present; trusted server writer pending)

## Phase 4 — Alpha validation

- [ ] Apply migrations to an isolated Intellectro Supabase project and pass the multi-user RLS verification gate
- [ ] Run Contextual Trust Comprehension study
- [ ] Measure governance burden
- [ ] Evaluate summary faithfulness
- [ ] Evaluate challenge mechanics for misuse
- [ ] Review security/rate-limit abuse paths
- [ ] Decide whether any agent capability should expand

## Explicitly deferred

Do not pull these into the alpha unless a separate decision record changes scope:

- algorithmic feed ranking
- autonomous public agent posting
- open agent marketplace
- federation
- full DID/portable cryptographic identity system
- native mobile applications
- livestreaming
- reels-style video infrastructure
- advertising system
- proprietary engagement optimization
- broad personal-agent automation

## Authority-expansion gate

Autonomous or higher-impact agent capabilities are not roadmap inevitabilities. They require evidence from alpha behavior, a threat review, updated permission tests, and an explicit ADR.
