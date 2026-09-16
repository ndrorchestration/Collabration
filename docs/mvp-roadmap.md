# MVP Roadmap

## Evidence notation

A checked repository item means the implementation exists and is covered by repository verification. Live-state claims are called out separately. The dedicated Collabration Supabase project (current provider display name **Intellectro**, ref `hibesaapldkvgkydvbds`) has passed schema admission, the original multi-user database/RLS verification, the governed-alpha candidate's targeted authority probes, PR #16's relationship/RLS/block-precedence admission matrix, and PR #24's Space-invitation/join-policy live admission matrix. Overall production persistence remains **NOT VERIFIED** until the browser OTP/PKCE/session Gate B passes.

PR #9 established the accepted governed/persisted-alpha repository base. Post-#9 work must preserve its fail-closed authority semantics; later roadmap entries are targets, not claims of current capability.

## Phase 0 — Repository and governance foundation

- [x] Define principal/agent identity schema
- [x] Implement deny-by-default capability model
- [x] Add capability matrix validation
- [x] Define action/provenance event schemas
- [x] Implement rate limits for agent registration/actions
- [x] Add permission, attribution, and rate-limit tests
- [x] Threat-model the vertical slice
- [x] Make production missing/partial persistence configuration an explicit unhealthy runtime state in the post-#9 integration candidate
- [ ] Establish enforced required-check protection for `main` where the GitHub control plane supports it

## Phase 1 — Familiar social Space

- [x] Create application shell
- [x] Add authentication runtime wiring (validated SSR claims, PKCE callback, refresh-cookie proxy; production browser verification pending)
- [x] Add profiles (persisted server-action path implemented; live database/RLS boundary verified, including reciprocal block-aware discovery after PR #16 admission)
- [x] Add Spaces/membership (atomic owner creation, controlled open join, and invite-only membership path implemented; current Space-invitation/join-policy database boundary live-verified)
- [x] Add posts and comments (human/source-linked post + comment persistence paths implemented; live database/RLS boundary verified)
- [x] Add chronological feed
- [x] Add basic reactions (authenticated path + membership-gated RLS; live member/non-member probe passed)
- [x] Add report, block, and mute (authenticated UI/persistence paths implemented; report membership gate live-probed; block now has separately admitted bilateral relationship/privacy and pending-invitation terminalization semantics; realistic multi-account abuse behavior remains an alpha validation item)
- [x] Add person-to-person connection-request lifecycle: request, accept, decline, cancel, disconnect
- [x] Establish repository-level block/privacy precedence across profile discovery, relationship visibility, request, acceptance, and pending Space invitations; relationship and invitation migrations have targeted live admission evidence on the dedicated project

## Phase 2 — Governance-native interaction

- [x] Add source-linked post type and atomic persistence path
- [x] Add support / challenge / qualify / add-evidence responses
- [x] Add typed AI-assistance labels
- [x] Add trust/context chips
- [x] Add provenance records plus a narrow approved-action receipt writer (provenance remains distinct from truth)
- [x] Add permission inspector
- [x] Add action-log viewer
- [x] Add correction / appeal flow (append-only request/resolution ledger; original target remains unchanged)
- [x] Define repository-level Content Passport `0.1.0-alpha` contract with exact subject/source revision lineage, accountable human/agent actors, immutable snapshots, and fail-closed currentness states
- [x] Define immutable/revision-aware subject identity and source-revision comparison semantics in the Content Passport package contract
- [ ] Bind persisted/derived application content to Content Passport subject and source revisions
- [ ] Surface `inputs changed since generation` when a persisted bound source revision advances
- [ ] Define the distinct Action Receipt contract without treating approval/execution as correctness
- [ ] Define the distinct Verification Result contract without implying broader certification

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

- [x] Apply the pre-relationship canonical migrations to the dedicated Collabration Supabase project (provider display name Intellectro) and pass the multi-user RLS verification gate
- [x] Admit the governed-alpha database migrations and pass targeted live social-safety, governed-action, provenance, correction/appeal, replay, and cross-Space authority probes
- [x] Add repository adversarial regression coverage for forged identity, capability self-expansion, replay, cross-Space moderation, direct audit/provenance bypass, unsafe redirect, viewer-local mute semantics, and bilateral block/relationship semantics
- [x] Apply and live-verify the connection-relationship migration against the dedicated Supabase project
- [x] Apply and live-verify the Space-invitation/join-policy migration against the dedicated Supabase project, including current-policy recheck, wrong-actor denial, replay rejection, member-only grants, and block terminalization
- [ ] Pass the production browser OTP/PKCE/session verification gate
- [ ] Run realistic multi-account challenge/report/block/mute/connection and rate-limit abuse tests
- [ ] Run Contextual Trust Comprehension formative study
- [ ] Measure governance burden
- [ ] Evaluate summary faithfulness
- [ ] Evaluate challenge mechanics for misuse
- [ ] Establish revision/currentness comprehension baseline
- [ ] Decide whether any agent capability should expand

External runtime, operations, real-model product-loop, and evaluation completion requirements are tracked in GitHub issue #10. Supabase performance-advisor debt is tracked separately in issue #11 so optimization changes receive their own regression and live-verification wave.

## Phase 5 — Social collaboration

This phase turns discussion into useful shared work before broad agent autonomy.

- [x] Connections/friend requests implemented as explicit mutual connection lifecycle; human connection grants no agent capability, Space role, or governance authority
- [x] Space invitations with explicit acceptance/revocation (repository implementation plus dedicated live database/RLS admission; Browser Gate B remains separate)
- [x] Minimal shared work object: research question/project (repository-domain contract only; persistence/UI deferred)
- [x] Minimal task/artifact/outcome representation (repository-domain contract only; persistence/UI deferred)
- [ ] Conversation-to-project conversion without losing source/discussion lineage
- [x] Live multi-user relationship/RLS and privacy/block-precedence probes
- [x] Live Space-invitation/join-policy authority, replay, policy-recheck, and block-terminalization probes
- [ ] Persist and surface research/project collaboration objects through an independently verified database/UI lane
- [ ] Observe at least one repeated useful collaborative-outcome loop with real users before expanding scope

Product target:

`connect → Space → discuss → coordinate → produce artifact/task/outcome`

Brand-level learning loop:

`connect → collaborate → calibrate → learn → improve → celebrate → repeat`

The brand loop is product language, not a claim that every stage is implemented or empirically validated.

## Phase 6 — Personal Agent copilot

Introduce the Personal Agent only after identity/session, memory isolation, and minimum accountability infrastructure are credible.

- [ ] Add Personal Agent contract with accountable owner
- [ ] Add server-only provider/model adapter
- [ ] Add least-privilege tool broker
- [ ] Add scope-aware memory with owner, visibility, origin, retention, sensitivity, and derivation metadata
- [ ] Add user-visible `Why does my agent know this?` inspection
- [ ] Permit private research, organize, summarize, compare, draft, and private-note workflows
- [ ] Deny direct consequential public/shared-state mutation in the initial release
- [ ] Add prompt-injection, cross-scope memory, and private-context exfiltration adversarial tests

## Phase 7 — Governed Personal Agent actions

Authority expands capability-by-capability rather than via a generic autonomy switch.

- [ ] Canonical action digest binding actor, agent, owner, capability, scope, target/input revisions, operation parameters, and policy version
- [ ] Expiring, single-use approval/authorization semantics
- [ ] Runtime revalidation of volatile membership/role/revocation predicates
- [ ] Explicit rollback/revocation behavior
- [ ] Proposer/verifier separation for selected higher-impact actions
- [ ] User-approved share into a Space
- [ ] User-approved shared task/project mutation
- [ ] Explicit disclosure/export approval for private context
- [ ] Replay/stale/substitution tests
- [ ] Capability-specific release/hold record

Progression:

`private suggestion → private draft → user-approved share → user-approved shared-state action → narrowly preauthorized reversible action → carefully released automation`

## Phase 8 — Governed agent collaboration

- [ ] Personal Agent → specialist/community-agent delegation contract
- [ ] Delegated authority may preserve or reduce capability/scope/budget only
- [ ] Parent/child execution lineage
- [ ] Delegation-laundering adversarial tests
- [ ] Disagreement-preserving synthesis rather than forced consensus
- [ ] Explicit affected-party/privacy rules for cross-user agent interaction

## Phase 9 — Controlled beta and business validation

- [ ] Validate free/low-friction human social participation
- [ ] Test Personal Agent Pro value proposition
- [ ] Test Space/Team Pro administration/shared-agent value
- [ ] Measure AI/tool cost per accepted collaborative outcome
- [ ] Define transparent execution allowances rather than exposing raw token accounting
- [ ] Launch-jurisdiction privacy/AI-transparency/moderation review
- [ ] Data retention/export/delete flows

## Naming boundary

Collabration is the canonical current product identity. **Intellectro** remains a historical/provider alias where old repository URLs, current provider display names, commits, deployments, or evidence require it. The rename itself advances none of the roadmap evidence gates above.
