# Intellectro Alpha Completion Design

## Goal

Move Intellectro from an early functional alpha to an evidence-bounded invite-only alpha without expanding autonomous agent authority.

## Completion definition

Alpha completion requires four independent predicates:

1. **Repository completion:** the scoped social-safety, governance-inspection, approval/audit, test, and documentation work is implemented and exact-head CI passes.
2. **Runtime completion:** the production deployment is bound to the accepted Git SHA and the browser auth/session Gate B passes against the dedicated Intellectro Supabase project.
3. **Product-loop completion:** the canonical path can be exercised from human source-linked post through contextual challenge, governed agent draft, moderator decision, and inspectable action/provenance record.
4. **Evaluation completion:** the Contextual Trust Comprehension instrument has at least one recorded alpha run and no unresolved blocker invalidates the interpretation.

No one predicate substitutes for another.

## Constraints

- Governance remains deny-by-default.
- Autonomous public posting, banning, deletion, policy change, and self-escalation remain denied.
- Human identity comes from validated server-side claims, never form-supplied actor IDs.
- Ordinary browser clients retain no direct INSERT policy on `agent_actions` or `provenance_records`.
- Provenance records origin/transformation, not truth.
- No ranking model is introduced.
- No federation, marketplace, advertising, native-mobile, reels/livestream, or broad personal-agent automation work enters this alpha.
- Any model-provider integration is server-only, optional, and fail-closed when its secret/configuration is absent.
- Evidence from DGAF or other NDR projects does not transfer into Intellectro.

## Adopted governance direction

Intellectro may reuse governance lessons from DGAF as design inputs only. ADR 0004 formalizes **pattern transfer without authority transfer**.

The product-native target for consequential AI activity is:

`request → typed capability → policy decision → approval/verifier when required → execution → durable receipt → challenge/correction`

This alpha should strengthen the parts of that path already within scope: typed capabilities, policy decisions, human approval, governed-action lifecycle, provenance receipts, inspection, correction/appeal, and adversarial verification.

Later authority expansion must remain independently gated by Intellectro evidence. Before any broader autonomous capability is released, Intellectro should require its own versioned policy change, adversarial permission tests, approval/reviewer semantics, rollback or revocation path, durable receipt behavior, runtime evidence, and explicit release decision.

For selected high-impact actions, the component proposing an action should not be the sole authority validating that action when a separately scoped verifier or human reviewer is practical.

DGAF freeze state, authorization, PASS/VERIFIED evidence, PDMAL findings, scientific conclusions, custody artifacts, and experiment results remain non-transferable.

## Architecture

### Social safety

Complete the already-modeled `reactions`, `reports`, `blocks`, and `mutes` paths through authenticated server actions. Block/mute filtering is applied before rendering feed/community activity. Reports preserve reporter ownership and do not create moderator sanctions automatically.

### Governance inspection

Expose a permission inspector derived from the machine-readable capability matrix and an authenticated action-log view derived from governed `agent_actions`/`approval_records`. The UI must distinguish allowed, approval-required, and denied capabilities without implying that permission means an action occurred.

### Governed action lifecycle

Add narrowly scoped database RPCs for creating pending agent-action records and recording trusted provenance after a human-approved output. RPCs derive ownership/approver identity from `auth.uid()`, bind a policy version, restrict agent/capability pairs to the alpha matrix, and reject autonomous publication. They are not general client INSERT bypasses.

The application exposes a moderator review queue. Approval/rejection is human-controlled. Approval changes only the recorded governed-action state unless a separately implemented executor produces a public artifact. No model output is fabricated.

### Agent execution boundary

The existing Community and Claim Agent contracts remain the authority for allowed planning/draft behavior. A provider adapter may later produce draft text server-side, but the repository must remain buildable and safe with no model secret. Missing provider configuration yields an explicit unavailable state, never silent fallback or fake AI output.

### Browser/runtime gate

Production persistence remains NOT VERIFIED until Vercel public Supabase configuration and Supabase Auth redirect configuration exist and the real OTP/PKCE/session matrix passes. This is an external control-plane dependency, not a code-completion substitute.

### Evaluation

Contextual Trust Comprehension remains the primary alpha metric. The instrument must test author identity, AI involvement, capability/authority, approver, source support, dispute state, and correction/challenge path. Governance burden and summary faithfulness remain secondary metrics.

## Testing strategy

Use RED → GREEN cycles for every repository behavior. Add structural migration tests for new RLS/RPC invariants, application-boundary tests for server actions and rendered controls, governance tests for alpha capability alignment, and adversarial tests for actor forgery, unsafe redirects, cross-Space approval, self-escalation, direct audit/provenance inserts, and block/mute visibility semantics.

The next adversarial expansion should include replay/stale-approval behavior, provenance-receipt tampering assumptions, and fail-open dependency checks before any matching authority is enabled.

Live browser Gate B and alpha human evaluation remain evidence-producing runtime tasks and cannot be replaced by structural tests.

## Operational completion

Before alpha freeze:

- reconcile README/roadmap/live-verification docs to actual Supabase state;
- maintain an executable GitHub issue backlog for unresolved external gates;
- require exact-head CI for merge decisions;
- protect `main` with required checks if the connected GitHub control plane permits it, otherwise record that as an external repository-setting blocker;
- capture the accepted alpha candidate SHA, deployment ID, database project ref, verification verdicts, and evaluation record in the Intellectro OCC/evidence docs.
