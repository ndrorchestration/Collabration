import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  new URL('../supabase/migrations/20260911064000_performance_hardening.sql', import.meta.url),
  'utf8'
);

const normalize = (value) => value.replace(/\s+/g, ' ').trim().toLowerCase();
const sql = normalize(migration);

const expectedIndexes = [
  ['agent_actions', 'owner_id'],
  ['approval_records', 'approver_id'],
  ['claim_responses', 'author_id'],
  ['comments', 'author_id'],
  ['correction_requests', 'requester_id'],
  ['correction_requests', 'resolved_by'],
  ['post_sources', 'added_by'],
  ['post_sources', 'source_id'],
  ['posts', 'author_id'],
  ['provenance_records', 'post_id'],
  ['reactions', 'user_id'],
  ['reports', 'comment_id'],
  ['reports', 'post_id'],
  ['reports', 'reporter_id'],
  ['sources', 'created_by'],
  ['space_memberships', 'user_id'],
  ['spaces', 'created_by']
];

const optimizedPolicies = [
  ['profiles', 'profiles own insert'],
  ['profiles', 'profiles own update'],
  ['space_memberships', 'memberships self leave'],
  ['posts', 'posts own update'],
  ['posts', 'posts own delete'],
  ['comments', 'comments own update'],
  ['comments', 'comments own delete'],
  ['reactions', 'reactions own delete'],
  ['claim_responses', 'claim responses own delete'],
  ['sources', 'sources own insert'],
  ['sources', 'sources own update'],
  ['sources', 'sources own delete'],
  ['post_sources', 'post sources own delete'],
  ['reports', 'reports own read'],
  ['blocks', 'blocks own read'],
  ['blocks', 'blocks own delete'],
  ['mutes', 'mutes own read'],
  ['mutes', 'mutes own insert'],
  ['mutes', 'mutes own delete']
];

test('performance hardening adds a leading-column index for every admitted FK advisor finding', () => {
  for (const [table, column] of expectedIndexes) {
    const indexName = `${table}_${column}_idx`;
    assert.match(
      sql,
      new RegExp(`create index if not exists ${indexName} on public\\.${table} \\(${column}\\)`, 'i'),
      `missing covering index ${indexName}`
    );
  }
});

test('performance hardening rewrites every admitted auth RLS finding through an init-plan-safe auth.uid selector', () => {
  for (const [table, policy] of optimizedPolicies) {
    const policyStart = `alter policy "${policy}" on public.${table}`;
    const start = sql.indexOf(policyStart);
    assert.notEqual(start, -1, `missing policy rewrite: ${table}.${policy}`);
    const nextAlter = sql.indexOf('alter policy ', start + policyStart.length);
    const block = sql.slice(start, nextAlter === -1 ? sql.length : nextAlter);
    assert.match(block, /\(select auth\.uid\(\)\)/, `policy does not use init-plan-safe auth.uid(): ${table}.${policy}`);
    assert.doesNotMatch(block, /(?<!select )auth\.uid\(\)/, `policy retains row-by-row auth.uid(): ${table}.${policy}`);
  }
});

test('performance hardening stays performance-only', () => {
  assert.doesNotMatch(sql, /create policy|drop policy|grant |revoke |security definer|security invoker/i);
  assert.doesNotMatch(sql, /insert into|update public\.|delete from/i);
});
