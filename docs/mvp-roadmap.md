# MVP Roadmap

## Phase 0 — Repository and governance foundation

- [x] Define principal/agent identity schema
- [x] Implement deny-by-default capability model
- [ ] Add capability matrix validation
- [x] Define action/provenance event schemas
- [x] Implement rate limits for agent registration/actions
- [x] Add permission, attribution, and rate-limit tests
- [x] Threat-model the vertical slice

## Phase 1 — Familiar social Space

- [x] Create application shell (demo-mode web shell)
- [ ] Add authentication (Supabase SSR/OTP boundary scaffolded; live project/session flow pending)
- [ ] Add profiles (schema present; persisted profile flow pending)
- [ ] Add Spaces/membership (schema + demo Space present; persisted membership flow pending)
- [ ] Add posts and comments (schema + demo posts present; persisted composer/comments pending)
- [x] Add chronological feed
- [ ] Add basic reactions (schema present; UI/persistence pending)
- [ ] Add report, block, and mute (RLS-backed schema present; UI/persistence pending)

## Phase 2 — Governance-native interaction

- [x] Add source-linked post type
- [x] Add support / challenge / qualify responses (demo interaction + domain/schema contract)
- [x] Add typed AI-assistance labels
- [x] Add trust/context chips
- [x] Add provenance records (domain + schema; trusted persistence writer still pending)
- [ ] Add permission inspector
- [ ] Add action-log viewer
- [ ] Add correction / appeal flow

## Phase 3 — Bounded agents

- [x] Community Agent in read/summarize/recommend mode
- [x] Claim Agent in evidence-assistant mode
- [ ] Human approval workflow for public agent outputs (kernel + schema boundary present; review/execution flow pending)
- [ ] Moderator review queue
- [ ] Agent action/audit persistence (schema present; trusted server writer pending)

## Phase 4 — Alpha validation

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
