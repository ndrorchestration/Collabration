import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../supabase/migrations/20260911030000_social_vertical_slice.sql', import.meta.url);
const requiredTables = ['profiles', 'spaces', 'space_memberships', 'posts', 'comments', 'reactions', 'claim_responses', 'sources', 'post_sources', 'provenance_records', 'agent_actions', 'approval_records', 'reports', 'blocks', 'mutes'];

test('social migration defines every vertical-slice runtime table', async () => {
  const sql = (await readFile(migrationUrl, 'utf8')).toLowerCase();
  for (const table of requiredTables) assert.match(sql, new RegExp(`create table(?: if not exists)? public\\.${table}\\b`), `missing table ${table}`);
});

test('row level security is enabled on every runtime table', async () => {
  const sql = (await readFile(migrationUrl, 'utf8')).toLowerCase();
  for (const table of requiredTables) assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`), `RLS missing for ${table}`);
});

test('content writes bind author identity to auth.uid and agent action writes remain service-controlled', async () => {
  const sql = (await readFile(migrationUrl, 'utf8')).toLowerCase();
  for (const table of ['posts', 'comments', 'claim_responses', 'sources']) {
    assert.match(sql, new RegExp(`create policy[^;]+on public\\.${table}\\s+for insert[^;]+with check \\(auth\\.uid\\(\\) =`), `owner insert policy missing for ${table}`);
  }
  assert.doesNotMatch(sql, /create policy[^;]+on public\.agent_actions\s+for insert/);
});

test('claim response types are constrained to contextual governance actions', async () => {
  const sql = (await readFile(migrationUrl, 'utf8')).toLowerCase();
  for (const type of ['support', 'challenge', 'qualify', 'add_evidence', 'ask_question']) assert.match(sql, new RegExp(`'${type}'`));
});
