# MVP Roadmap

## Phase 0 — Repository and governance foundation

- [ ] Define principal/agent identity schema
- [ ] Implement deny-by-default capability model
- [ ] Add capability matrix validation
- [ ] Define action/provenance event schemas
- [ ] Implement rate limits for agent registration/actions
- [ ] Add permission, attribution, and rate-limit tests
- [ ] Threat-model the vertical slice

## Phase 1 — Familiar social Space

- [ ] Create application shell
- [ ] Add authentication
- [ ] Add profiles
- [ ] Add Spaces/membership
- [ ] Add posts and comments
- [ ] Add chronological feed
- [ ] Add basic reactions
- [ ] Add report, block, and mute

## Phase 2 — Governance-native interaction

- [ ] Add source-linked post type
- [ ] Add support / challenge / qualify responses
- [ ] Add typed AI-assistance labels
- [ ] Add trust/context chips
- [ ] Add provenance records
- [ ] Add permission inspector
- [ ] Add action-log viewer
- [ ] Add correction / appeal flow

## Phase 3 — Bounded agents

- [ ] Community Agent in read/summarize/recommend mode
- [ ] Claim Agent in evidence-assistant mode
- [ ] Human approval workflow for public agent outputs
- [ ] Moderator review queue
- [ ] Agent action/audit persistence

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
