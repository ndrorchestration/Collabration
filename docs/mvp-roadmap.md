# MVP Roadmap

## Evidence notation

A checked repository item means the implementation exists and is covered by repository verification. Live-state claims are called out separately. The dedicated Intellectro Supabase project has passed schema admission, the original multi-user database/RLS verification, and the alpha-completion candidate's targeted authority probes. Overall production persistence remains **NOT VERIFIED** until the browser OTP/PKCE/session Gate B passes.

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
- [x] Add authentication runtime wiring (validated SSR claims, PKCE callback, refresh-cookie proxy; production browser verification pending)
- [x] Add profiles (persisted server-action path implemented; live database/RLS boundary verified)
- [x] Add Spaces/membership (atomic owner creation + join path implemented; live database/RLS boundary verified)
- [x] Add posts and comments (human/source-linked post + comment persistence paths implemented; live database/RLS boundary verified)
- [x] Add chronological feed
- [x] Add basic reactions (authenticated path + membership-gated RLS; live member/non-member probe passed)
- [x] Add report, block, and mute (authenticated UI/persistence paths implemented; report membership gate live-probed; realistic multi-account abuse behavior remains an alpha validation item)

## Phase 2 — Governance-native interaction

- [x] Add source-linked post type and atomic persistence path
- [x] Add support / challenge / qualify / add-evidence responses
- [x] Add typed AI-assistance labels
- [x] Add trust/context chips
- [x] Add provenance records plus a narrow approved-action receipt writer (provenance remains distinct from truth)
- [x] Add permission inspector
- [x] Add action-log viewer
- [x] Add correction / appeal flow (append-only request/resolution ledger; original target remains unchanged)

## Phase 3 — Bounded agents

- [x] Community Agent in read/summarize/recommend mode
- [x] Claim Agent in evidence-assistant mode
- [x] Add governed pending-action request and human moderator decision lifecycle (record-only; no model execution/publication side effect)
- [x] Moderator review queue
- [x] Agent action/audit persistence through narrow governed RPCs
- [ ] Exercise real model-backed product loop
- [ ] Execute bounded Claim/Community Agent work through a server-only provider path that fails closed when unconfigured
- [ ] Demonstrate permitted publication only after the applicable human approval and preserve attributable action/provenance records

## Phase 4 — Alpha validation

- [x] Apply migrations to an isolated Intellectro Supabase project and pass the multi-user RLS verification gate
- [x] Admit the alpha-completion database migrations and pass targeted live social-safety, governed-action, provenance, correction/appeal, replay, and cross-Space authority probes
- [x] Add repository adversarial regression coverage for forged identity, capability self-expansion, replay, cross-Space moderation, direct audit/provenance bypass, unsafe redirect, and viewer-local safety semantics
- [ ] Pass the production browser OTP/PKCE/session verification gate
- [ ] Run realistic multi-account challenge/report/block/mute and rate-limit abuse tests
- [ ] Establish enforced required-check protection for `main` where the GitHub control plane supports it
- [ ] Run Contextual Trust Comprehension study
- [ ] Measure governance burden
- [ ] Evaluate summary faithfulness
- [ ] Evaluate challenge mechanics for misuse
- [ ] Decide whether any agent capability should expand

External runtime, operations, real-model product-loop, and evaluation completion requirements are tracked in GitHub issue #10. Supabase performance-advisor debt is tracked separately in issue #11 so optimization changes receive their own regression and live-verification wave.

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

Autonomous or higher-impact agent capabilities are not roadmap inevitabilities. They require evidence from alpha behavior, a threat review, updated permission tests, and an explicit ADR. Repository or database completion alone does not authorize any expansion.