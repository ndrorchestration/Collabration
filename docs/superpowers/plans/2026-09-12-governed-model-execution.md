# Governed Model Execution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a provider-neutral, fail-closed execution substrate that turns an approved Intellectro draft capability into one private immutable AI draft, then requires a separate human-approved publication action before any attributable post/provenance record can be created.

**Architecture:** Keep governance authority in the existing `agent_actions` / `approval_records` model and add an isolated execution artifact layer. An atomic database claim consumes each approved draft action once before any provider call; a server-only provider adapter produces draft text; a separate publication action binds to the exact draft ID + SHA-256 digest; an atomic publish RPC rechecks approval/currentness/Space/agent/digest before creating the public post and provenance receipt. The first implementation ships with a disabled production provider and a dependency-injected deterministic test provider only—no live model credential or paid invocation.

**Tech Stack:** Node.js >=22, ESM, `node:test`, Next.js 16.3.4 App Router/server actions, React 19.2.8, Supabase SSR/Postgres/RLS/RPC, GitHub Actions Node 22/24 + Next.js production build.

**Spec:** `docs/superpowers/specs/2026-09-12-governed-model-execution-design.md`

## Global Constraints

- Governance remains deny-by-default.
- Approval to execute a draft never authorizes publication.
- Each approved draft action authorizes at most one provider attempt; success or failure is terminal for that action.
- The database must atomically create a unique `running` execution receipt before any provider call.
- Regeneration or retry after failure requires a new governed draft request and fresh human approval.
- Publication requires a distinct governed publish action bound server-side to the exact immutable draft ID and `content_sha256`.
- Autonomous public posting remains denied.
- Provider adapters cannot approve actions, mutate moderation state, grant capabilities, or publish posts.
- The default provider is disabled; the deterministic test provider is dependency-injected in tests and is not selected through ordinary production configuration.
- No provider secret enters browser code, `NEXT_PUBLIC_*`, GitHub, Notion, action logs, provenance records, or fixtures.
- Provenance records origin/transformation history, not truth.
- Human identity continues to derive from validated server-side auth claims / `auth.uid()`; client-supplied actor identity is never authoritative.
- Evidence from DGAF or any other NDR system does not transfer into Intellectro.
- Browser Gate B, production persistence, real-provider execution, model quality, human CTC evaluation, production readiness, and Alpha Complete remain NOT VERIFIED unless separately evidenced.

---

## File Structure

### New database contract
- `supabase/migrations/20260912060000_governed_model_execution.sql` — immutable drafts, single-attempt execution receipts, publication binding, RPCs, RLS/ACLs, atomic publish.
- `tests/governed-model-execution-migration.test.js` — static contract assertions for tables, constraints, RLS, ACLs, RPC authorization, replay/currentness rules.

### New provider/execution module
- `packages/model-execution/package.json` — private workspace package metadata.
- `packages/model-execution/src/index.js` — public exports only.
- `packages/model-execution/src/errors.js` — bounded execution error codes/classes.
- `packages/model-execution/src/provider.js` — provider interface validation + disabled provider.
- `packages/model-execution/src/canonical-input.js` — deterministic canonical input document + SHA-256 helper.
- `packages/model-execution/src/executor.js` — provider-neutral orchestration after database claim; no database implementation details.
- `tests/model-provider-boundary.test.js` — disabled provider, deterministic injected provider, output validation, no production selector for test provider.
- `tests/model-canonical-input.test.js` — deterministic serialization/digest and stale/cross-Space rejection at resolver boundary.
- `tests/model-executor.test.js` — one-attempt flow, failure finalization, replay/no-second-call behavior.

### Web/server integration
- `apps/web/lib/model-execution/context.js` — resolve approved action + source-linked post/source context from Supabase and build canonical execution inputs.
- `apps/web/lib/model-execution/run.js` — compose Supabase claim/finalize calls with `@intellectro/model-execution`; production default uses disabled provider.
- `apps/web/app/app/actions.js` — add `executeApprovedAgentDraft`, `requestAgentDraftPublication`, `publishApprovedAgentDraft` server actions.
- `apps/web/app/app/page.js` — query drafts/receipts/publication actions for active Space and pass them into review UI.
- `apps/web/components/review-panel.js` — separate execution review, exact draft review, publication request/approval/publish states.
- `tests/model-execution-server-boundary.test.js` — server action/RPC names and no client authority leakage.
- `tests/model-execution-ui.test.js` — visible separation between execution approval, draft state, publication approval, and publish action.

### Adversarial/evidence
- `tests/model-execution-adversarial.test.js` — replay, cross-Space, stale policy/digest, unapproved/rejected publication, direct browser write denial, no autonomous publish path.
- `docs/evidence/supabase-governed-model-execution-live-verification-2026-09-12.md` — live migration/probe/advisor evidence after admission.
- `docs/supabase-live-verification.md` — current live DB/RLS state reconciliation.
- `docs/alpha-completion-gates.md` — product-loop substrate state vs real-provider/runtime non-claims.
- `README.md` — bounded public-facing implementation status only after verification.

---

### Task 1: Add the database execution/publication contract

**Files:**
- Create: `tests/governed-model-execution-migration.test.js`
- Create: `supabase/migrations/20260912060000_governed_model_execution.sql`

**Interfaces:**
- Consumes: existing `agent_actions`, `approval_records`, `posts`, `post_sources`, `sources`, `provenance_records`, `space_memberships`, `is_space_member(uuid)`, `is_space_moderator(uuid)`.
- Produces tables: `agent_drafts`, `agent_execution_receipts`, `agent_publications`.
- Produces RPC: `claim_approved_agent_execution(p_action_id uuid, p_provider_kind text, p_input_sha256 text) returns uuid`.
- Produces RPC: `complete_agent_execution_success(p_receipt_id uuid, p_content text, p_content_sha256 text, p_model_identifier text, p_input_refs jsonb, p_supersedes_draft_id uuid default null) returns uuid`.
- Produces RPC: `complete_agent_execution_failure(p_receipt_id uuid, p_failure_code text) returns void`.
- Produces RPC: `request_agent_draft_publication(p_draft_id uuid) returns uuid`.
- Produces RPC: `publish_approved_agent_draft(p_publication_action_id uuid) returns uuid`.

- [ ] **Step 1: Write the RED structural contract test**

Create `tests/governed-model-execution-migration.test.js` using `node:test`, `node:assert/strict`, and `readFileSync`. Require the migration to contain all of these contracts:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(
  new URL('../supabase/migrations/20260912060000_governed_model_execution.sql', import.meta.url),
  'utf8'
);

test('governed model execution schema is append-only and replay resistant', () => {
  assert.match(sql, /create table public\.agent_drafts/i);
  assert.match(sql, /execution_action_id uuid not null unique/i);
  assert.match(sql, /content_sha256 text not null/i);
  assert.match(sql, /status text not null[^;]+current[^;]+superseded[^;]+published/is);
  assert.match(sql, /create table public\.agent_execution_receipts/i);
  assert.match(sql, /execution_action_id uuid not null unique/i);
  assert.match(sql, /running[^;]+succeeded[^;]+failed/is);
  assert.match(sql, /create table public\.agent_publications/i);
  assert.match(sql, /publication_action_id uuid not null unique/i);
  assert.match(sql, /draft_id uuid not null unique/i);
});

test('ordinary browser roles cannot write execution artifacts directly', () => {
  for (const table of ['agent_drafts', 'agent_execution_receipts', 'agent_publications']) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
  assert.doesNotMatch(sql, /create policy[^;]+agent_drafts[^;]+for insert[^;]+to authenticated/is);
  assert.doesNotMatch(sql, /create policy[^;]+agent_execution_receipts[^;]+for insert[^;]+to authenticated/is);
});

test('RPCs are authenticated-only and fail closed', () => {
  for (const fn of [
    'claim_approved_agent_execution',
    'complete_agent_execution_success',
    'complete_agent_execution_failure',
    'request_agent_draft_publication',
    'publish_approved_agent_draft'
  ]) {
    assert.match(sql, new RegExp(`revoke execute on function public\\.${fn}`, 'i'));
    assert.match(sql, new RegExp(`grant execute on function public\\.${fn}.*to authenticated`, 'is'));
  }
  assert.match(sql, /approval_status\s*<>\s*'approved'/i);
  assert.match(sql, /policy_version\s*<>\s*'0\.1\.0-alpha'/i);
  assert.match(sql, /content_sha256/i);
  assert.match(sql, /for update/i);
});
```

- [ ] **Step 2: Run the RED test and prove the missing migration is the only intended failure**

Run:

```bash
node --test tests/governed-model-execution-migration.test.js
```

Expected: FAIL with `ENOENT` for `20260912060000_governed_model_execution.sql`. Then run the full suite:

```bash
npm test
```

Expected: existing tests remain PASS; the new migration-contract test fails only because the migration does not exist.

- [ ] **Step 3: Implement `agent_drafts`, execution receipts, and publication linkage**

Create the migration with these minimum constraints:

```sql
create table public.agent_drafts (
  id uuid primary key default gen_random_uuid(),
  execution_action_id uuid not null unique references public.agent_actions(id) on delete restrict,
  space_id uuid not null references public.spaces(id) on delete cascade,
  agent_id text not null,
  capability text not null check (capability in ('draft_public_content','draft_annotation')),
  policy_version text not null,
  content text not null check (char_length(content) between 1 and 20000),
  content_sha256 text not null check (content_sha256 ~ '^[0-9a-f]{64}$'),
  input_refs jsonb not null default '[]'::jsonb,
  supersedes_draft_id uuid references public.agent_drafts(id) on delete restrict,
  status text not null default 'current' check (status in ('current','superseded','published')),
  created_at timestamptz not null default now()
);

create table public.agent_execution_receipts (
  id uuid primary key default gen_random_uuid(),
  execution_action_id uuid not null unique references public.agent_actions(id) on delete restrict,
  draft_id uuid unique references public.agent_drafts(id) on delete restrict,
  provider_kind text not null,
  model_identifier text,
  input_sha256 text not null check (input_sha256 ~ '^[0-9a-f]{64}$'),
  output_sha256 text check (output_sha256 is null or output_sha256 ~ '^[0-9a-f]{64}$'),
  status text not null check (status in ('running','succeeded','failed')),
  failure_code text,
  policy_version text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.agent_publications (
  id uuid primary key default gen_random_uuid(),
  publication_action_id uuid not null unique references public.agent_actions(id) on delete restrict,
  draft_id uuid not null unique references public.agent_drafts(id) on delete restrict,
  post_id uuid unique references public.posts(id) on delete restrict,
  provenance_id uuid unique references public.provenance_records(id) on delete restrict,
  published_by uuid references auth.users(id) on delete restrict,
  published_at timestamptz
);
```

Enable RLS on all three. Add SELECT policies limited to users who can already see the governing action / active Space. Do not add authenticated INSERT/UPDATE/DELETE policies.

- [ ] **Step 4: Implement atomic execution claim**

`claim_approved_agent_execution(p_action_id, p_provider_kind, p_input_sha256)` must:

1. derive `auth.uid()` and reject null;
2. lock the target `agent_actions` row `FOR UPDATE`;
3. require `approval_status='approved'`;
4. require `policy_version='0.1.0-alpha'`;
5. require capability in `draft_public_content|draft_annotation`;
6. require current authenticated user to be the action owner **or** a current moderator/admin for that Space;
7. reject if a receipt already exists for the action;
8. insert exactly one `running` receipt with unique `execution_action_id` and supplied canonical input digest;
9. return the receipt ID.

Use a uniqueness violation / explicit `55000` exception to prevent concurrent second claims.

- [ ] **Step 5: Implement success/failure finalizers**

`complete_agent_execution_success(p_receipt_id,p_content,p_content_sha256,p_model_identifier,p_input_refs,p_supersedes_draft_id)` must lock the `running` receipt, require the same action/Space/policy context, insert one immutable draft, set output digest, bind `draft_id`, and finalize receipt `succeeded`. It must reject a non-running receipt. If `p_supersedes_draft_id` is non-null, require that older draft to be in the same Space/agent and mark it `superseded` only after the new draft has been admitted.

`complete_agent_execution_failure(p_receipt_id,p_failure_code)` must lock a `running` receipt, allow only a bounded failure code allowlist (`provider_unavailable`, `provider_timeout`, `provider_failure`, `invalid_provider_output`, `stale_input`, `policy_mismatch`), set `failed`, set `completed_at`, and create no draft.

- [ ] **Step 6: Implement server-created publication request**

`request_agent_draft_publication(p_draft_id)` must derive the caller, lock/read the current draft, require `status='current'`, require caller can act in the draft Space, map `draft_public_content→publish_public_content` and `draft_annotation→publish_annotation`, and insert a new `agent_actions` row with `approval_status='pending'` and canonical server-built `input_refs` containing `type='agent_draft'`, the exact stored draft UUID, and the exact stored SHA-256 digest.

Create an `agent_publications` row binding the new publication action to the exact draft. Do not accept client-supplied digest/agent/Space/capability.

- [ ] **Step 7: Implement atomic publish RPC**

`publish_approved_agent_draft(p_publication_action_id)` must transactionally re-check:

- caller authenticated;
- publication action is `approved`;
- `policy_version='0.1.0-alpha'`;
- bound draft exists and remains `current`;
- publication action's server-created draft ref ID + SHA exactly match stored draft;
- action/draft Space and agent match;
- draft/publish capability pair matches;
- `agent_publications.post_id is null` and draft is not already published;
- caller is current moderator/admin for the Space.

On success insert exactly one `posts` row with `kind='ai_assisted'`, `ai_assisted=true`, `ai_assistance_type='agent_generated'`, `agent_id` copied from the draft, and `human_approved=true`.

Insert one `provenance_records` row recording the draft/input refs and a transformation object with `type='governed_agent_draft'`, the exact draft UUID, and exact content SHA-256; update `agent_publications` with post/provenance/publisher/timestamp; set draft `published`. Return the post UUID. Any failure rolls back all mutations.

- [ ] **Step 8: Lock down function ACLs**

Use these exact ACL statements after the five function definitions:

```sql
revoke all on function public.claim_approved_agent_execution(uuid,text,text) from public;
revoke execute on function public.claim_approved_agent_execution(uuid,text,text) from anon;
grant execute on function public.claim_approved_agent_execution(uuid,text,text) to authenticated;

revoke all on function public.complete_agent_execution_success(uuid,text,text,text,jsonb,uuid) from public;
revoke execute on function public.complete_agent_execution_success(uuid,text,text,text,jsonb,uuid) from anon;
grant execute on function public.complete_agent_execution_success(uuid,text,text,text,jsonb,uuid) to authenticated;

revoke all on function public.complete_agent_execution_failure(uuid,text) from public;
revoke execute on function public.complete_agent_execution_failure(uuid,text) from anon;
grant execute on function public.complete_agent_execution_failure(uuid,text) to authenticated;

revoke all on function public.request_agent_draft_publication(uuid) from public;
revoke execute on function public.request_agent_draft_publication(uuid) from anon;
grant execute on function public.request_agent_draft_publication(uuid) to authenticated;

revoke all on function public.publish_approved_agent_draft(uuid) from public;
revoke execute on function public.publish_approved_agent_draft(uuid) from anon;
grant execute on function public.publish_approved_agent_draft(uuid) to authenticated;
```

Set every RPC `security definer` and `set search_path = ''`; fully qualify every object reference.

- [ ] **Step 9: Run the migration contract test and full repository suite**

Run:

```bash
node --test tests/governed-model-execution-migration.test.js
npm run check
npm run validate:governance
npm test
```

Expected: all PASS.

- [ ] **Step 10: Commit**

```bash
git add tests/governed-model-execution-migration.test.js supabase/migrations/20260912060000_governed_model_execution.sql
git commit -m "feat: add governed model execution database contract"
```

---

### Task 2: Add provider-neutral canonical input and provider contracts

**Files:**
- Create: `packages/model-execution/package.json`
- Create: `packages/model-execution/src/index.js`
- Create: `packages/model-execution/src/errors.js`
- Create: `packages/model-execution/src/provider.js`
- Create: `packages/model-execution/src/canonical-input.js`
- Create: `tests/model-provider-boundary.test.js`
- Create: `tests/model-canonical-input.test.js`

**Interfaces:**
- Produces: `ExecutionError`, `EXECUTION_ERROR_CODES`, `createDisabledProvider()`, `assertProviderResult(result)`, `buildCanonicalExecutionInput(context)`, `sha256Hex(text)`, `serializeCanonicalExecutionInput(input)`.
- Consumed later by: Task 3 executor and web integration.

- [ ] **Step 1: Write RED provider tests**

Require disabled provider behavior and test-provider injection without production selection:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDisabledProvider, assertProviderResult } from '../packages/model-execution/src/index.js';

test('disabled provider fails closed without output', async () => {
  const provider = createDisabledProvider();
  await assert.rejects(
    () => provider.generateDraft({ executionIdempotencyKey: 'r1' }),
    (error) => error.code === 'provider_unavailable'
  );
});

test('provider output must be bounded text with non-secret identifiers', () => {
  assert.throws(() => assertProviderResult({ content: '', providerKind: 'test', modelIdentifier: 'fixture' }), /invalid_provider_output/);
  assert.throws(() => assertProviderResult({ content: 'x'.repeat(20001), providerKind: 'test', modelIdentifier: 'fixture' }), /invalid_provider_output/);
});
```

Also statically assert there is no `INTELLECTRO_PROVIDER=test`, `deterministic-test` env selector, or `NEXT_PUBLIC_*` provider secret path in production modules.

- [ ] **Step 2: Write RED canonical-input tests**

Test exact deterministic equality across object-key ordering and digest stability:

```js
const context = {
  policyVersion: '0.1.0-alpha',
  agentId: 'claim_agent',
  capability: 'draft_annotation',
  space: { id: 'space-1', slug: 'research' },
  post: { id: 'post-1', body: 'Claim body' },
  sources: [{ id: 'src-1', url: 'https://example.com/a', title: 'A', publisher: null }]
};
const a = buildCanonicalExecutionInput(context);
const b = buildCanonicalExecutionInput(structuredClone(context));
assert.equal(serializeCanonicalExecutionInput(a), serializeCanonicalExecutionInput(b));
assert.equal(sha256Hex(serializeCanonicalExecutionInput(a)).length, 64);
```

Require sorted sources by stable ID/URL and rejection when required Space/post identifiers are missing.

- [ ] **Step 3: Run RED tests**

```bash
node --test tests/model-provider-boundary.test.js tests/model-canonical-input.test.js
```

Expected: FAIL because `@intellectro/model-execution` files do not exist.

- [ ] **Step 4: Implement package metadata**

```json
{
  "name": "@intellectro/model-execution",
  "version": "0.0.1-alpha",
  "private": true,
  "type": "module",
  "exports": "./src/index.js"
}
```

No provider SDK dependency is added.

- [ ] **Step 5: Implement bounded errors**

Define only the approved codes:

```js
export const EXECUTION_ERROR_CODES = new Set([
  'provider_unavailable', 'action_not_approved', 'action_already_executed',
  'execution_in_progress', 'stale_input', 'policy_mismatch', 'provider_timeout',
  'provider_failure', 'invalid_provider_output', 'draft_superseded',
  'publication_not_approved', 'publication_replay', 'cross_space_binding'
]);

export class ExecutionError extends Error {
  constructor(code, message = code) {
    if (!EXECUTION_ERROR_CODES.has(code)) throw new TypeError(`Unsupported execution error code: ${code}`);
    super(message);
    this.name = 'ExecutionError';
    this.code = code;
  }
}
```

- [ ] **Step 6: Implement disabled provider and output validation**

`createDisabledProvider()` returns `{ kind: 'disabled', generateDraft: async () => { throw new ExecutionError('provider_unavailable'); } }`.

`assertProviderResult(result)` requires a plain object; trimmed content length `1..20000`; `providerKind` length `1..80`; `modelIdentifier` length `1..200`; optional `providerRequestId` length <= 200; and returns a frozen normalized result.

Do **not** implement a production provider selector.

- [ ] **Step 7: Implement deterministic canonical serialization**

Use Node `createHash('sha256')`. Build a fixed-shape JSON document with explicit keys in this order:

```js
{
  version: 'intellectro.execution-input.v1',
  policyVersion,
  agentId,
  capability,
  space: { id, slug },
  post: { id, body },
  sources: [...stableSortedSources]
}
```

`serializeCanonicalExecutionInput()` must call `JSON.stringify()` only on the fixed-shape object produced by the builder; callers cannot supply arbitrary recursively keyed objects.

- [ ] **Step 8: Run focused + full tests**

```bash
node --test tests/model-provider-boundary.test.js tests/model-canonical-input.test.js
npm run check
npm test
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add packages/model-execution tests/model-provider-boundary.test.js tests/model-canonical-input.test.js
git commit -m "feat: add provider-neutral execution contracts"
```

---

### Task 3: Implement one-attempt server execution orchestration

**Files:**
- Create: `packages/model-execution/src/executor.js`
- Modify: `packages/model-execution/src/index.js`
- Create: `tests/model-executor.test.js`
- Create: `apps/web/lib/model-execution/context.js`
- Create: `apps/web/lib/model-execution/run.js`
- Create: `tests/model-execution-server-boundary.test.js`

**Interfaces:**
- Consumes: Task 1 RPCs and Task 2 provider/canonical-input functions.
- Produces: `executeClaimedDraft({ context, provider, claimExecution, finalizeSuccess, finalizeFailure })`; `resolveExecutionContext(supabase, actionId)`; `runApprovedDraftExecution({ supabase, actionId, provider? })`.

- [ ] **Step 1: Write RED pure executor tests**

Inject spies rather than database/network dependencies:

```js
test('executor claims before invoking provider and finalizes one success', async () => {
  const calls = [];
  const result = await executeClaimedDraft({
    context: FIXTURE_CONTEXT,
    provider: { generateDraft: async () => { calls.push('provider'); return { content: 'draft', providerKind: 'fixture', modelIdentifier: 'deterministic-v1' }; } },
    claimExecution: async () => { calls.push('claim'); return { receiptId: 'r1' }; },
    finalizeSuccess: async () => { calls.push('success'); return { draftId: 'd1' }; },
    finalizeFailure: async () => { calls.push('failure'); }
  });
  assert.deepEqual(calls, ['claim', 'provider', 'success']);
  assert.equal(result.draftId, 'd1');
});
```

Add cases: claim throws → provider count 0; provider throws bounded failure → `finalizeFailure` exactly once; invalid provider output → failure finalizer; no automatic second provider call.

- [ ] **Step 2: Run RED executor test**

```bash
node --test tests/model-executor.test.js
```

Expected: FAIL because executor export does not exist.

- [ ] **Step 3: Implement `executeClaimedDraft`**

Sequence must be exactly: build fixed canonical input; compute input digest; call `claimExecution`; call provider once; normalize/validate result; compute exact output digest over normalized content; call `finalizeSuccess`; on provider/output error after successful claim, call `finalizeFailure` once then rethrow bounded `ExecutionError`.

Never retry provider internally.

- [ ] **Step 4: Write RED Supabase context resolver tests/static boundary tests**

Require `context.js` to query the action first, then referenced post + post_sources/sources, verify same `space_id`, approved action, policy `0.1.0-alpha`, and capability is a draft capability. Require no caller-provided prompt/content/provider/model.

- [ ] **Step 5: Implement `resolveExecutionContext(supabase, actionId)`**

Read action fields `id, agent_id, owner_id, space_id, capability, policy_version, approval_status, input_refs`. Require exactly one supported source-linked post reference in `input_refs` for the first alpha implementation. Resolve the post inside the same Space and fetch source rows through `post_sources`. Missing/cross-Space/stale refs throw `ExecutionError('stale_input')` or `ExecutionError('cross_space_binding')`.

- [ ] **Step 6: Implement `runApprovedDraftExecution` with disabled default**

`run.js` must default to `createDisabledProvider()` and accept an explicit `provider` argument only for server-side tests/internal composition. Before the database claim, check `provider.kind === 'disabled'` and throw `provider_unavailable` so an unavailable provider does not consume the one authorized attempt.

For an enabled injected provider, call the exact RPCs/signatures from Task 1 through Supabase:

```js
supabase.rpc('claim_approved_agent_execution', {
  p_action_id: actionId,
  p_provider_kind: provider.kind,
  p_input_sha256: inputSha256
});

supabase.rpc('complete_agent_execution_success', {
  p_receipt_id: receiptId,
  p_content: normalized.content,
  p_content_sha256: outputSha256,
  p_model_identifier: normalized.modelIdentifier,
  p_input_refs: context.inputRefs,
  p_supersedes_draft_id: context.supersedesDraftId ?? null
});

supabase.rpc('complete_agent_execution_failure', {
  p_receipt_id: receiptId,
  p_failure_code: error.code
});
```

No service-role client is introduced; the authenticated server Supabase client carries the user's validated session and the RPC enforces final database authority.

- [ ] **Step 7: Run focused + full tests**

```bash
node --test tests/model-executor.test.js tests/model-execution-server-boundary.test.js
npm run check
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/model-execution/src apps/web/lib/model-execution tests/model-executor.test.js tests/model-execution-server-boundary.test.js
git commit -m "feat: add one-attempt governed draft executor"
```

---

### Task 4: Add server actions for execute, publication request, and explicit publish

**Files:**
- Modify: `apps/web/app/app/actions.js`
- Modify: `tests/model-execution-server-boundary.test.js`
- Create: `tests/governed-publication.test.js`

**Interfaces:**
- Produces: server actions `executeApprovedAgentDraft(formData)`, `requestAgentDraftPublication(formData)`, `publishApprovedAgentDraft(formData)`.
- Consumes: `runApprovedDraftExecution`, Task 1 publication RPCs, existing `authenticatedClient()` and `refreshApp()`.

- [ ] **Step 1: Add RED server-action assertions**

Assert the file exports all three actions, obtains `authenticatedClient()`, accepts only `action_id` or `draft_id`/`publication_action_id`, and does not accept provider/model/prompt/digest/actor/Space from the form.

- [ ] **Step 2: Add RED publication flow contract test**

Statically require:

```js
assert.match(actions, /runApprovedDraftExecution\(\{\s*supabase,\s*actionId/s);
assert.match(actions, /rpc\('request_agent_draft_publication'/);
assert.match(actions, /rpc\('publish_approved_agent_draft'/);
assert.doesNotMatch(actions, /formData\.get\(['"]provider/);
assert.doesNotMatch(actions, /formData\.get\(['"]content_sha256/);
```

- [ ] **Step 3: Run RED tests**

```bash
node --test tests/model-execution-server-boundary.test.js tests/governed-publication.test.js
```

Expected: FAIL because actions do not exist.

- [ ] **Step 4: Implement `executeApprovedAgentDraft`**

```js
export async function executeApprovedAgentDraft(formData) {
  const { supabase } = await authenticatedClient();
  const actionId = requiredId(formData, 'action_id');
  await runApprovedDraftExecution({ supabase, actionId });
  refreshApp();
}
```

With the default disabled provider, execution returns `provider_unavailable` before claiming the database attempt; no receipt is created and the approval remains unconsumed.

- [ ] **Step 5: Implement publication request action**

`requestAgentDraftPublication` accepts `draft_id` only and calls `request_agent_draft_publication` with `{ p_draft_id: draftId }`. No digest or capability comes from the form.

- [ ] **Step 6: Implement explicit publish action**

`publishApprovedAgentDraft` accepts `publication_action_id` only and calls `publish_approved_agent_draft` with `{ p_publication_action_id: publicationActionId }`. It does not call a model.

- [ ] **Step 7: Verify tests**

```bash
node --test tests/model-execution-server-boundary.test.js tests/governed-publication.test.js
npm run check
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/web/app/app/actions.js tests/model-execution-server-boundary.test.js tests/governed-publication.test.js
git commit -m "feat: add governed execution and publication server actions"
```

---

### Task 5: Expose the two-stage lifecycle in the review UI

**Files:**
- Modify: `apps/web/app/app/page.js`
- Modify: `apps/web/components/review-panel.js`
- Create: `tests/model-execution-ui.test.js`

**Interfaces:**
- Page produces props: `executionReceipts`, `agentDrafts`, `publicationActions`, `publications` plus action handlers.
- Review panel consumes those props and renders separate execution/draft/publication states.

- [ ] **Step 1: Write RED UI contract tests**

Require copy and form/action separation:

```js
assert.match(panel, /Execution approval does not authorize publication/i);
assert.match(panel, /Private draft/i);
assert.match(panel, /Request publication/i);
assert.match(panel, /Publish approved draft/i);
assert.match(panel, /content digest/i);
assert.doesNotMatch(panel, /model output is verified/i);
```

Require page queries `agent_execution_receipts`, `agent_drafts`, and `agent_publications` only inside the active Space context.

- [ ] **Step 2: Run RED test**

```bash
node --test tests/model-execution-ui.test.js
```

Expected: FAIL because new props/copy/query paths do not exist.

- [ ] **Step 3: Extend active-Space queries**

In `page.js`, add Supabase queries for drafts in `activeSpace.id` ordered newest first; execution receipts joined through action/draft visibility; publication actions with the two publish capabilities; and `agent_publications` for the active Space. Do not fetch across Spaces and filter client-side when RLS/query constraints can scope directly.

- [ ] **Step 4: Wire action handlers**

Import and pass `executeApprovedAgentDraft`, `requestAgentDraftPublication`, and `publishApprovedAgentDraft`.

- [ ] **Step 5: Render execution state separately from approval state**

For approved draft actions with no receipt, ordinary runtime must show `Provider unavailable — execution remains disabled` because the production provider remains disabled. Do not render an enabled execution button unless a later explicitly authorized provider lane changes that state. For `running`, show `Execution in progress`; for failed, show bounded failure code only; for succeeded, show draft identity.

- [ ] **Step 6: Render immutable draft review and publication request**

For each current draft show exact draft text; agent/capability; policy version; SHA-256 digest prefix plus inspectable full digest; and `Request publication` action if no publication action exists. Never call it published/approved/verified because generation succeeded.

- [ ] **Step 7: Render publication review and explicit publish**

Existing moderator `decideAgentAction` handles the publication action's pending approval/rejection. After approval, render a distinct `Publish approved draft` form bound to `publication_action_id`. Rejected actions expose no publish control.

- [ ] **Step 8: Run UI + production build**

```bash
node --test tests/model-execution-ui.test.js
npm test
npm run build:web
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/web/app/app/page.js apps/web/components/review-panel.js tests/model-execution-ui.test.js
git commit -m "feat: expose governed draft and publication review states"
```

---

### Task 6: Add adversarial coverage and admit the database contract live

**Files:**
- Create: `tests/model-execution-adversarial.test.js`
- Create after successful live verification: `docs/evidence/supabase-governed-model-execution-live-verification-2026-09-12.md`

**Interfaces:**
- Consumes: all Task 1–5 contracts.
- Produces: repository adversarial PASS plus live Supabase DB/RLS evidence; still does **not** produce real-provider or Browser Gate B evidence.

- [ ] **Step 1: Write repository adversarial tests before live admission**

Cover at minimum: anonymous EXECUTE revoked on all new RPCs; browser roles have no direct write policies on drafts/receipts/publication linkage; pending/rejected execution action cannot claim; duplicate/concurrent claim blocked by unique action receipt; failure receipt cannot transition back to running/success through another attempt; publication request does not accept caller-supplied digest/agent/Space; publication action must be separately approved; digest mismatch blocks publication; superseded/published draft cannot republish; cross-Space action/draft binding blocks; publication replay creates no second post; model output is never consulted for authorization; no autonomous-publication path exists; deterministic test provider has no production env selector.

- [ ] **Step 2: Run full exact-head repository verification before touching live Supabase**

```bash
npm run check
npm run validate:governance
npm test
npm run build:web
```

Expected: all PASS locally; GitHub PR CI must independently prove Node 22 + Node 24 + production build.

- [ ] **Step 3: Open/refresh a draft implementation PR and require exact-head CI GREEN**

Do not apply the migration live while the exact candidate CI is failing. Record exact candidate SHA and CI run ID in the PR body.

- [ ] **Step 4: Record live Supabase pre-admission baseline**

Against dedicated project `hibesaapldkvgkydvbds`, capture migration ledger; security advisor findings; performance advisor findings; and absence/row-count baseline for the three new tables.

- [ ] **Step 5: Apply exact migration artifact**

Apply `20260912060000_governed_model_execution.sql` exactly as verified on the PR candidate. Record the live ledger timestamp/name.

- [ ] **Step 6: Verify ACL/RLS structure live**

SQL assertions must prove `anon` execute = false for all new RPCs; `authenticated` execute = true; no direct authenticated INSERT/UPDATE/DELETE policy on `agent_drafts`, `agent_execution_receipts`, `agent_publications`; unique constraints exist for single execution/publication consumption; RLS enabled.

- [ ] **Step 7: Run disposable multi-user live behavior matrix**

Use synthetic auth UUID identities and transaction-scoped claim context. Verify these exact cases:

```text
A member requests draft action                    ALLOW
Nonmember requests action                         DENY
Member approves own pending action without mod    DENY
Moderator approves draft action                   ALLOW
Owner/mod claims approved execution               ALLOW
Second claim same action                          DENY
Claim pending/rejected action                     DENY
Complete success creates exactly one draft        ALLOW
Failure finalizer creates no draft                PASS
Request publication from exact current draft      ALLOW
Client-forged digest path                          ABSENT/DENY
Member approves publication without mod           DENY
Moderator approves publication                    ALLOW
Cross-Space moderator publishes                   DENY
Publish approved exact draft                      ALLOW
Replay publish                                    DENY
Published draft status                            published
One post + one provenance + one linkage           EXACT
```

Because no real provider is needed, simulate only the database finalizer inputs after the execution claim. Label this explicitly as **database execution-boundary verification**, not model execution.

- [ ] **Step 8: Purge synthetic data and prove zero residue**

Delete all synthetic Spaces/users in dependency-safe order or wrap probes in rollback where possible. Query all three new tables plus touched posts/provenance/actions for probe identifiers and require zero.

- [ ] **Step 9: Rerun security/performance advisors**

Classify any new authenticated `SECURITY DEFINER` warnings as intentional only after verifying anon EXECUTE revoked and internal authorization. New performance findings must be separately evaluated; do not silently change authority to optimize them.

- [ ] **Step 10: Write dated live evidence record**

Document repository candidate SHA; exact CI run; migration repository name + live ledger name; ACL/RLS results; positive/negative behavior matrix counts; advisor before/after; zero-residue result; and explicit non-claims for real provider, production runtime, Browser Gate B, model quality, CTC, and Alpha Complete.

- [ ] **Step 11: Commit evidence and rerun exact-head CI**

```bash
git add tests/model-execution-adversarial.test.js docs/evidence/supabase-governed-model-execution-live-verification-2026-09-12.md
git commit -m "test: verify governed model execution boundary"
```

Then require fresh GitHub CI for the evidence head.

---

### Task 7: Reconcile canonical documentation and merge the verified substrate

**Files:**
- Modify: `docs/supabase-live-verification.md`
- Modify: `docs/alpha-completion-gates.md`
- Modify: `README.md`
- Modify: `tests/documentation-state.test.js`
- Update PR body / GitHub issue #10 commentary.
- Update Notion `Intellectro — Operational Control Center` only after signed post-merge main verification.

**Interfaces:**
- Produces: canonical state that says execution substrate implemented/live-DB-verified if true, while Product-loop real-provider/runtime predicate remains NOT VERIFIED.

- [ ] **Step 1: Add RED documentation-state assertions**

Require canonical docs to contain all of:

```text
provider-neutral execution substrate
single provider attempt per approved draft action
separate publication approval
real provider execution: NOT VERIFIED
Browser Gate B: NOT VERIFIED
Alpha Complete: NO
```

Require `docs/supabase-live-verification.md` to name the new live migration ledger and evidence file once admitted.

- [ ] **Step 2: Run RED documentation test**

```bash
node --test tests/documentation-state.test.js
```

Expected: FAIL on missing/stale execution-substrate state until docs are updated.

- [ ] **Step 3: Update live verification page**

Add only evidence supported by Task 6. Keep database/RLS and runtime/browser/provider evidence in separate sections.

- [ ] **Step 4: Update alpha completion gates**

Promote only predicates actually satisfied:

```text
Repository governed-execution substrate: PASS (only after final exact-head CI is green)
Database governed-execution boundary: PASS (only after live probes pass)
Real provider execution: NOT VERIFIED
Production persisted product loop: NOT VERIFIED
Browser Gate B: NOT VERIFIED
Human evaluation: NOT VERIFIED
Alpha Complete: NO
```

- [ ] **Step 5: Update README public status conservatively**

Describe that Intellectro has a verified provider-neutral execution/publication boundary with the real provider disabled. Do not advertise live AI execution or production readiness.

- [ ] **Step 6: Run final full verification**

```bash
npm run check
npm run validate:governance
npm test
npm run build:web
```

Then require GitHub exact-head CI: Node 22 PASS, Node 24 PASS, Next.js production build PASS.

- [ ] **Step 7: Perform final diff/review gate**

Review every changed file for actor identity derived server-side; no service-role/browser secret; no provider selector exposing deterministic fixture in production; no execution-on-approval side effect; no publication without separate approval; no digest supplied by client; one-attempt uniqueness; no hidden authority expansion; no documentation overclaim.

Any discovered defect creates another RED→GREEN cycle and invalidates earlier exact-head CI for merge purposes.

- [ ] **Step 8: Merge only the exact reviewed GREEN head**

Use expected-head SHA protection on the merge call. Do not merge if the PR head moves after CI/review.

- [ ] **Step 9: Verify post-merge `main` independently**

Require signed/verified merge commit; `main` points to expected merge; post-merge push CI Node 22 PASS; Node 24 PASS; Next.js production build PASS.

- [ ] **Step 10: Update issue #10 without closing it**

Mark only the repository/database **substrate** portion complete. Explicitly retain production Vercel public Supabase configuration; Supabase Auth Site/Redirect configuration; Browser Gate B; protected `main`; explicitly authorized real-provider adapter/credentials; deployed real-provider end-to-end product-loop evidence; and human CTC evaluation.

- [ ] **Step 11: Reconcile Notion OCC after post-merge verification**

Record exact signed `main`, CI run, live migration ledger, database probe result, and non-claims. Do not copy mutable GitHub details into unrelated Notion pages or create a second competing current-state owner.

- [ ] **Step 12: Final completion statement for this lane**

The strongest allowable conclusion is:

```text
Provider-neutral governed execution/publication substrate: IMPLEMENTED / REPOSITORY VERIFIED
Dedicated Supabase execution/publication boundary: LIVE DB/RLS VERIFIED
Real provider execution: NOT VERIFIED
Production product loop: NOT VERIFIED
Browser Gate B: NOT VERIFIED
Human evaluation: NOT VERIFIED
Alpha Complete: NO
```

Do not promote beyond that without the external evidence tracked by issue #10.
