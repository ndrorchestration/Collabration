import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('governed action RPCs derive identity, bind policy, and fail closed on capabilities', () => {
  const sql = read('supabase/migrations/20260911052000_governed_action_lifecycle.sql');
  assert.match(sql, /create or replace function public\.request_governed_agent_action/);
  assert.match(sql, /create or replace function public\.decide_governed_agent_action/);
  assert.match(sql, /auth\.uid\(\)/);
  assert.match(sql, /0\.1\.0-alpha/);
  assert.match(sql, /community_agent/);
  assert.match(sql, /claim_agent/);
  assert.match(sql, /draft_public_content/);
  assert.match(sql, /draft_annotation/);
  assert.match(sql, /approval_status = 'pending'/);
  assert.match(sql, /for update/);
  assert.match(sql, /public\.is_space_moderator/);
  assert.match(sql, /revoke execute on function public\.request_governed_agent_action.* from anon/is);
  assert.match(sql, /revoke execute on function public\.decide_governed_agent_action.* from anon/is);
});

test('approval records can no longer be inserted directly by ordinary browser roles', () => {
  const sql = read('supabase/migrations/20260911052000_governed_action_lifecycle.sql');
  assert.match(sql, /drop policy if exists "approval moderator insert" on public\.approval_records/);
  assert.doesNotMatch(sql, /create policy .*approval.*insert.*approval_records/is);
});

test('application routes requests and decisions through governed RPCs', () => {
  const actions = read('apps/web/app/app/actions.js');
  assert.match(actions, /export async function requestAgentAction\(/);
  assert.match(actions, /rpc\('request_governed_agent_action'/);
  assert.match(actions, /export async function decideAgentAction\(/);
  assert.match(actions, /rpc\('decide_governed_agent_action'/);
  assert.doesNotMatch(actions, /from\('approval_records'\)\.insert/);
});

test('persisted app exposes bounded request and moderator decision controls without claiming execution', () => {
  const page = read('apps/web/app/app/page.js');
  const review = read('apps/web/components/review-panel.js');
  assert.match(page, /Request governed agent draft/);
  assert.match(page, /No model executes from this request/);
  assert.match(review, /Pending agent actions/);
  assert.match(review, /Approval does not execute a model, establish truth, or publish output by itself/);
  assert.match(review, /decideAgentAction/);
  assert.match(page, /decideAgentAction=\{decideAgentAction\}/);
});
