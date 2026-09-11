import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('approved action provenance writer is narrow, authenticated, and approval-bound', () => {
  const sql = read('supabase/migrations/20260911054000_provenance_receipt_boundary.sql');
  assert.match(sql, /create or replace function public\.record_approved_action_provenance/);
  assert.match(sql, /auth\.uid\(\)/);
  assert.match(sql, /approval_status = 'approved'/);
  assert.match(sql, /public\.is_space_moderator/);
  assert.match(sql, /jsonb_typeof/);
  assert.match(sql, /insert into public\.provenance_records/);
  assert.match(sql, /revoke execute on function public\.record_approved_action_provenance.* from anon/is);
  assert.match(sql, /grant execute on function public\.record_approved_action_provenance.* to authenticated/is);
});

test('provenance boundary does not create a generic browser insert policy or truth fields', () => {
  const sql = read('supabase/migrations/20260911054000_provenance_receipt_boundary.sql');
  assert.doesNotMatch(sql, /create policy .*provenance.*insert/is);
  assert.doesNotMatch(sql, /\btruth\b/i);
  assert.doesNotMatch(sql, /\bconfidence\b/i);
});

test('server action uses the governed provenance RPC rather than direct table insertion', () => {
  const actions = read('apps/web/app/app/actions.js');
  assert.match(actions, /export async function recordApprovedActionProvenance\(/);
  assert.match(actions, /rpc\('record_approved_action_provenance'/);
  assert.doesNotMatch(actions, /from\('provenance_records'\)\.insert/);
});
