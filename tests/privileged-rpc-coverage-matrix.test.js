import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const matrixPath = 'governance/privileged-rpc-negative-authorization-matrix.json';
const expectedFunctions = [
  'block_user',
  'create_space_with_owner',
  'decide_connection_request',
  'decide_governed_agent_action',
  'decide_space_invitation',
  'disconnect_connection',
  'invite_to_space',
  'is_blocked_with_current_user',
  'join_open_space',
  'record_approved_action_provenance',
  'request_connection',
  'request_correction_or_appeal',
  'request_governed_agent_action',
  'resolve_correction_or_appeal',
  'revoke_space_invitation',
  'set_space_join_policy',
];
const dimensionNames = [
  'unauthenticated',
  'wrong_actor',
  'wrong_object_or_scope',
  'invalid_or_stale_lifecycle',
  'invalid_input',
];
const allowedDimensionStates = new Set(['VERIFIED', 'NOT_APPLICABLE', 'NOT_VERIFIED']);

const loadMatrix = () => JSON.parse(read(matrixPath));

const migrationText = () => {
  const dir = new URL('../supabase/migrations/', import.meta.url);
  return readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => read(`supabase/migrations/${name}`))
    .join('\n');
};

test('privileged RPC matrix covers the exact admitted 16-function surface', () => {
  const matrix = loadMatrix();
  assert.equal(matrix.schema_version, 1);
  assert.equal(matrix.source.live_project_ref, 'hibesaapldkvgkydvbds');
  assert.equal(matrix.source.advisor_finding_count, 16);

  const names = matrix.functions.map((entry) => entry.function).sort();
  assert.deepEqual(names, [...expectedFunctions].sort());
  assert.equal(new Set(names).size, 16);
});

test('every privileged RPC records explicit negative-test dimensions and evidence', () => {
  const matrix = loadMatrix();
  for (const entry of matrix.functions) {
    assert.ok(Array.isArray(entry.evidence_refs) && entry.evidence_refs.length > 0, `${entry.function} must cite evidence`);
    assert.deepEqual(Object.keys(entry.dimensions).sort(), [...dimensionNames].sort(), `${entry.function} dimension keys drifted`);
    for (const [dimension, state] of Object.entries(entry.dimensions)) {
      assert.ok(allowedDimensionStates.has(state), `${entry.function}.${dimension} has invalid state ${state}`);
    }
    const unresolved = Object.values(entry.dimensions).includes('NOT_VERIFIED');
    assert.equal(entry.coverage_status, unresolved ? 'PARTIAL' : 'VERIFIED', `${entry.function} coverage_status overstates evidence`);
  }
});

test('matrix functions remain repository-custodied SECURITY DEFINER boundaries with empty search_path', () => {
  const sql = migrationText();
  for (const functionName of expectedFunctions) {
    const block = sql.match(new RegExp(`create or replace function public\\.${functionName}\\([^]*?\\n\\$\\$;`, 'i'))?.[0] ?? '';
    assert.notEqual(block, '', `${functionName} declaration missing from migrations`);
    assert.match(block, /security definer/i, `${functionName} must remain SECURITY DEFINER`);
    assert.match(block, /set search_path = ''/i, `${functionName} must keep an empty search_path`);
  }
});
