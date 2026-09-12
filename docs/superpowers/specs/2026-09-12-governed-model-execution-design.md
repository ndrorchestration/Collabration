# Governed Model Execution Design

## Goal

Add the missing server-side execution architecture for Intellectro's governed AI product loop without granting autonomous publication authority, importing authority from another NDR project, or requiring a live model provider to be configured at merge time.

The target path is:

`human request → typed draft capability → human authorization → server-only model execution → immutable draft + execution receipt → separate publication request → human publication authorization → explicit publish step → attributable post + provenance receipt`

Execution and publication are separate predicates. Approval to execute a draft is never approval to publish it.

## Current boundary

The accepted alpha already supports:

- deny-by-default capability decisions;
- approval-required `draft_public_content`, `publish_public_content`, `draft_annotation`, and `publish_annotation` capabilities;
- authenticated governed-action request records;
- moderator approval/rejection records;
- approved-action provenance recording;
- human-authored and source-linked posts;
- database/RLS enforcement around Space authority.

Current approval changes recorded governance state only. It does not call a model, create model output, or publish agent content. That behavior is correct and remains the fail-closed baseline.

## Decision

Use a **provider-neutral, two-stage execution architecture**.

Stage 1 creates a private model-produced draft only after a draft-capability action has been human-approved. Stage 2 creates a distinct publication action bound to the exact immutable draft revision. A later explicit publish operation is allowed only when that publication action is independently human-approved.

This design is preferred over:

1. **Execute on approval.** Rejected because it conflates an authorization state transition with an external side effect and makes approval retries/provider failures harder to reason about.
2. **Execute and publish in one action.** Rejected because it collapses two materially different authorities and would make autonomous public posting easier to introduce accidentally.
3. **Provider-specific governance logic.** Rejected because capability, approval, replay, provenance, and publication semantics must not depend on a particular model vendor.

## Non-negotiable authority rules

- Governance remains deny-by-default.
- No model runs before a matching draft action is approved.
- Approval to execute does not authorize publication.
- No model adapter may publish a post, mutate moderation state, grant capabilities, or approve its own output.
- Autonomous public posting remains denied.
- The requester cannot act as the database authority merely by supplying an actor ID; server identity continues to derive from validated authentication state.
- Publication requires a distinct approval record after the draft exists.
- Publication is bound to the exact draft ID and content digest reviewed by the human approver.
- A changed, regenerated, or superseded draft invalidates the prior publication request.
- Replaying execution or publication must not create duplicate drafts or posts.
- Provider failure, timeout, malformed output, missing configuration, stale policy state, stale approval, or missing provenance inputs fail closed.
- Provenance records origin and transformation history; it does not certify truth.
- No provider secret is stored in browser code, public environment variables, GitHub, Notion, action logs, or provenance records.
- DGAF and other NDR systems may inform design patterns only; no authorization or verification state transfers into Intellectro.

## Capability interpretation

The existing capability names remain authoritative for this alpha.

### Community Agent

- `draft_public_content`: may produce a private candidate draft after human authorization.
- `publish_public_content`: may request publication of an existing exact draft; it does not grant self-publication.

### Claim Agent

- `draft_annotation`: may produce a private annotation draft after human authorization.
- `publish_annotation`: may request publication of an existing exact annotation draft; it does not grant self-publication.

No new broad capability such as `execute_model`, `publish_anything`, or `write_database` is introduced. Provider execution is an implementation mechanism beneath the already typed capability.

## Data model

### `agent_drafts`

Add an append-only draft artifact table with these semantic fields:

- `id` — immutable UUID;
- `execution_action_id` — unique FK to the approved draft action that authorized generation;
- `space_id` — Space copied from the authorized action;
- `agent_id` — agent identity copied from the authorized action;
- `capability` — draft capability copied from the authorized action;
- `policy_version` — policy version used for execution;
- `content` — generated draft text;
- `content_sha256` — digest of the exact stored draft bytes/text normalization contract;
- `input_refs` — exact input references admitted for execution;
- `status` — `current`, `superseded`, or `published`;
- `created_at` — server timestamp.

A draft is immutable once stored. Regeneration produces a new draft and marks the earlier draft `superseded`; it does not update the original content in place.

Ordinary browser roles receive read access only when they are authorized to inspect the governing action/Space. They receive no direct INSERT/UPDATE/DELETE path.

### `agent_execution_receipts`

Add an append-only execution receipt table with:

- `id`;
- `execution_action_id` — unique for successful terminal execution; retry attempts are represented separately in receipt status/history if required by implementation;
- `draft_id` — nullable on failed executions, populated on success;
- `provider_kind` — non-secret adapter identifier;
- `model_identifier` — non-secret model identifier when available;
- `input_sha256` — digest over the canonical admitted execution input;
- `output_sha256` — draft digest on success;
- `status` — `succeeded` or `failed`;
- `failure_code` — bounded sanitized failure classification, never raw secret-bearing provider output;
- `started_at` / `completed_at`;
- `policy_version`.

Receipts must not store credentials, authorization headers, full provider request objects, hidden chain-of-thought, or unrelated provider metadata.

### Publication binding

A publication request is represented by a new governed `agent_actions` record using the matching publish capability. Its `input_refs` must contain one canonical draft reference:

```json
{
  "type": "agent_draft",
  "id": "<draft uuid>",
  "sha256": "<exact content digest>"
}
```

Do not rely on a free-form client-supplied publication reference. A narrow server/database boundary must create this publication request from the stored draft and copy its ID/digest itself.

## Provider adapter boundary

Introduce an isolated server-only provider interface. Governance code calls the interface; provider implementations do not decide authorization.

Conceptual contract:

```text
generateDraft({
  agentId,
  capability,
  policyVersion,
  canonicalInputs,
  executionIdempotencyKey
})
→ {
  content,
  providerKind,
  modelIdentifier,
  providerRequestId?
}
```

The adapter may return text and non-secret operational identifiers only. It cannot receive Supabase service-role credentials, mutate Intellectro tables directly, publish content, or alter the governing action.

### Initial provider states

The first implementation must support:

1. **Disabled provider** — default production-safe state when no provider is intentionally configured. Execution returns an explicit unavailable result and creates no draft.
2. **Deterministic test provider** — test-only adapter for RED/GREEN integration and replay/failure tests. It must be impossible to select in production through ordinary runtime configuration.

A real provider adapter is a separate controlled addition. Adding one requires explicit operator authorization for its credential/billing path and does not by itself establish Product-loop PASS until live evidence exists.

## Canonical input construction

The executor must not accept an arbitrary client prompt as its authority-bearing input.

For the alpha product loop, execution inputs are built server-side from admitted references on the approved draft action. At minimum, the executor should support a source-linked post reference and resolve:

- post body;
- source metadata/links already attached to that post;
- relevant Space identity;
- agent role/capability instructions from repository-owned configuration;
- policy version.

The canonical input document is serialized deterministically and hashed before provider invocation. The execution receipt stores that digest.

If a referenced post/source is missing, outside the action's Space, blocked by current policy, or otherwise no longer admissible, execution is denied as stale rather than silently substituting different context.

## Execution state machine

For a draft action:

`pending → approved | rejected`

Only `approved` may enter execution.

Execution terminal states:

`not_started → succeeded | failed`

A successful execution creates exactly one immutable draft associated with the approved action. A repeated execution call for the same already-succeeded action returns the existing draft/receipt identity or an explicit already-executed result; it never calls the provider again.

A failed execution does not create a publishable draft. Retry behavior must be explicit and bounded. A retry must retain the same approved action and canonical input digest unless a new human authorization is required by a policy or input change.

## Publication state machine

A current draft may be submitted for publication through a narrow request boundary that creates a new governed action using the matching publish capability.

Publication action:

`pending → approved | rejected`

Only an `approved` publication action may enter explicit publication.

The publish operation re-checks atomically:

- publication action is approved;
- action policy version is currently admissible for this alpha path;
- referenced draft exists and is `current`;
- draft ID and content digest exactly match the publication action binding;
- draft and publication action share the same Space and agent;
- matching draft/publish capability pair is valid;
- no prior post has already been published from the same publication action/draft revision;
- current moderator/authority requirements still hold where the publish operation requires a human initiator.

On success, the operation creates:

1. one attributable `posts` row marked AI-assisted/agent-generated according to the existing trust vocabulary;
2. one provenance record linking the source/input references, draft transformation, governing actions, and publication identity;
3. a terminal linkage preventing replay;
4. draft status `published`.

The operation is atomic. If any part fails, no partial public post/provenance state is admitted.

## Human control and UX

The UI must show execution and publication as separate review moments.

For a draft request, expose:

- requesting human;
- agent and draft capability;
- source/input references;
- policy version;
- pending/approved/rejected status;
- execution unavailable/failed/succeeded state.

After successful execution, expose the exact draft content and digest-backed identity before publication can be requested.

For publication review, expose:

- exact draft content being reviewed;
- draft digest/currentness state;
- agent identity;
- requester;
- prior execution approval;
- supporting source/provenance inputs;
- approve/reject controls.

The UI must never label a generated draft as published, verified, true, or moderator-approved merely because model execution succeeded.

## Error handling

Use bounded error classes suitable for UI and audit without exposing secrets:

- `provider_unavailable`;
- `action_not_approved`;
- `action_already_executed`;
- `stale_input`;
- `policy_mismatch`;
- `provider_timeout`;
- `provider_failure`;
- `invalid_provider_output`;
- `draft_superseded`;
- `publication_not_approved`;
- `publication_replay`;
- `cross_space_binding`.

Raw provider response bodies are not surfaced to browser clients or durable public logs by default.

## Security and abuse boundaries

- The provider adapter runs only in a server context.
- Provider credentials are read only from server-only environment variables.
- Client-controlled fields cannot choose arbitrary provider endpoints or models unless a repository-owned allowlist explicitly permits them.
- Execution must enforce maximum input and output sizes.
- Provider calls must have timeouts and bounded retry behavior.
- User-provided source text is data, not instructions with governance authority.
- Prompt injection in referenced content cannot grant capabilities or change publication state.
- The executor cannot use model output as an authorization decision.
- Hidden provider/system prompts need not be exposed publicly, but the policy/capability and high-level transformation must remain inspectable.
- No hidden chain-of-thought is requested, stored, or exposed.

## Testing strategy

All implementation proceeds RED → GREEN.

### Repository/contract tests

Require before implementation:

- execution refuses pending/rejected actions;
- disabled provider produces no draft;
- deterministic test provider is forbidden in production selection;
- approved draft action produces one draft and receipt;
- duplicate execution does not invoke provider twice;
- forged actor/action ID cannot bypass authority;
- cross-Space input reference is rejected;
- missing/deleted/stale input is rejected;
- changed policy/input digest cannot silently reuse approval;
- provider failure/timeout/malformed output creates no draft;
- publication request copies exact draft ID/digest server-side;
- superseded draft cannot be published;
- unapproved/rejected publication creates no post;
- publication replay creates no duplicate post;
- publish action for another Space/agent/draft fails;
- successful publication atomically creates post + provenance + terminal linkage;
- autonomous publication path is absent;
- ordinary browser clients cannot directly insert drafts/receipts or bypass publication RPCs.

### Live database verification

If new database tables/RPCs are admitted to the dedicated Supabase project, verify positive and negative paths with disposable identities and zero-residue cleanup. Structural migration success alone is not sufficient evidence.

### Provider/runtime verification

A deterministic test adapter can establish repository logic only. Product-loop execution remains **NOT VERIFIED** until an explicitly authorized real provider is configured server-side and the exact deployed runtime demonstrates the full governed path.

## Evidence and completion semantics

The implementation may establish:

- provider-neutral execution architecture implemented;
- repository tests PASS;
- database/RLS execution boundary live-verified, if actually admitted and probed.

It may not establish without separate evidence:

- real provider execution VERIFIED;
- production Browser Gate B VERIFIED;
- production persistence VERIFIED;
- model quality/faithfulness VERIFIED;
- Contextual Trust Comprehension evaluation PASS;
- production readiness;
- autonomous agent safety;
- Alpha Complete.

The Product-loop predicate can pass only after a real deployed path demonstrates:

`human source-linked post → governed draft request → human execution approval → real bounded model draft → publication request bound to that exact draft → human publication approval → explicit attributable publication → durable provenance/action receipt`

and a rejection path demonstrates no publication.

## Scope of the first implementation plan

The first implementation plan should build the safe execution substrate without requiring paid/live provider use:

1. schema and RLS/RPC contract for immutable drafts, execution receipts, publication binding, replay prevention, and atomic publication;
2. server-only provider interface;
3. disabled provider plus deterministic test provider;
4. canonical-input builder for source-linked-post context;
5. server actions for execute approved draft, request publication, and publish approved draft;
6. moderator/reviewer UI states sufficient to exercise the two-stage lifecycle;
7. RED/GREEN repository tests and live Supabase admission probes;
8. evidence/docs reconciliation.

A real provider adapter and credential configuration are intentionally a separate operator-controlled lane after this substrate is verified.