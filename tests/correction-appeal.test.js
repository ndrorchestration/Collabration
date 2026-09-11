import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('correction requests are append-only, authenticated, and target exactly one governed artifact', () => {
  const migration = read('supabase/migrations/20260911056000_correction_appeal.sql');
  assert.match(migration, /create table public\.correction_requests/i);
  assert.match(migration, /status text not null default 'open'/i);
  assert.match(migration, /status in \('open','accepted','rejected','resolved'\)/i);
  assert.match(migration, /post_id is not null/i);
  assert.match(migration, /action_id is not null/i);
  assert.match(migration, /create or replace function public\.request_correction_or_appeal/i);
  assert.match(migration, /auth\.uid\(\)/i);
  assert.match(migration, /exactly one correction target required/i);
  assert.doesNotMatch(migration, /create policy[^;]+correction_requests[^;]+for update/is);
});

test('resolution is moderator-scoped to the target Space and cannot rewrite original content', () => {
  const migration = read('supabase/migrations/20260911056000_correction_appeal.sql');
  assert.match(migration, /create or replace function public\.resolve_correction_or_appeal/i);
  assert.match(migration, /public\.is_space_moderator/i);
  assert.match(migration, /correction request is not open/i);
  assert.match(migration, /resolved_by/i);
  assert.match(migration, /resolved_at/i);
  assert.doesNotMatch(migration, /update public\.posts\s+set\s+body/is);
  assert.doesNotMatch(migration, /update public\.agent_actions\s+set\s+(action|capability|input_refs)/is);
});

test('application exposes correction and appeal submission plus moderator resolution paths', () => {
  const actions = read('apps/web/app/app/actions.js');
  const page = read('apps/web/app/app/page.js');
  assert.match(actions, /requestCorrectionOrAppeal/);
  assert.match(actions, /request_correction_or_appeal/);
  assert.match(actions, /resolveCorrectionOrAppeal/);
  assert.match(actions, /resolve_correction_or_appeal/);
  assert.match(page, /Request correction or appeal/);
  assert.match(page, /Correction and appeal queue/);
  assert.match(page, /Original records remain unchanged/);
});
