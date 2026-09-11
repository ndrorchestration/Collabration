import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const migrationPath = 'supabase/migrations/20260911060000_connection_relationships.sql';

test('connection persistence uses one bounded relationship table with RLS', () => {
  const migration = read(migrationPath);
  assert.match(migration, /create table public\.connection_requests/i);
  assert.match(migration, /requester_id uuid not null references auth\.users\(id\)/i);
  assert.match(migration, /recipient_id uuid not null references auth\.users\(id\)/i);
  assert.match(migration, /status text not null default 'pending'/i);
  assert.match(migration, /pending.*accepted.*declined.*cancelled/s);
  assert.match(migration, /check \(requester_id <> recipient_id\)/i);
  assert.match(migration, /alter table public\.connection_requests enable row level security/i);
  assert.match(migration, /auth\.uid\(\).*requester_id.*auth\.uid\(\).*recipient_id/s);
});

test('only one active relationship may exist for an unordered user pair', () => {
  const migration = read(migrationPath);
  assert.match(migration, /create unique index.*least\(requester_id, recipient_id\).*greatest\(requester_id, recipient_id\)/is);
  assert.match(migration, /where status in \('pending', 'accepted'\)/i);
});

test('connection request RPC derives requester identity and blocks either-direction blocked pairs', () => {
  const migration = read(migrationPath);
  assert.match(migration, /create or replace function public\.request_connection\(p_recipient_id uuid\)/i);
  assert.match(migration, /v_requester_id uuid := auth\.uid\(\)/i);
  assert.match(migration, /blocker_id = v_requester_id.*blocked_id = p_recipient_id/s);
  assert.match(migration, /blocker_id = p_recipient_id.*blocked_id = v_requester_id/s);
  assert.doesNotMatch(migration, /p_requester_id/i);
});

test('connection decision RPC binds actor role, pending state, and rechecks block before acceptance', () => {
  const migration = read(migrationPath);
  assert.match(migration, /create or replace function public\.decide_connection_request\(p_request_id uuid, p_decision text\)/i);
  assert.match(migration, /status = 'pending'/i);
  assert.match(migration, /p_decision in \('accepted', 'declined', 'cancelled'\)/i);
  assert.match(migration, /p_decision = 'cancelled'.*requester_id/s);
  assert.match(migration, /p_decision in \('accepted', 'declined'\).*recipient_id/s);
  assert.match(migration, /p_decision = 'accepted'.*public\.blocks/s);
});

test('ordinary browser roles cannot directly insert update or delete relationship state', () => {
  const migration = read(migrationPath);
  assert.doesNotMatch(migration, /create policy[^;]+connection_requests[^;]+for insert/is);
  assert.doesNotMatch(migration, /create policy[^;]+connection_requests[^;]+for update/is);
  assert.doesNotMatch(migration, /create policy[^;]+connection_requests[^;]+for delete/is);
  assert.match(migration, /revoke all on function public\.request_connection\(uuid\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.request_connection\(uuid\) to authenticated/i);
  assert.match(migration, /revoke all on function public\.decide_connection_request\(uuid, text\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.decide_connection_request\(uuid, text\) to authenticated/i);
});

test('server actions route relationship changes through narrow RPCs without accepting actor ids from forms', () => {
  const actions = read('apps/web/app/app/actions.js');
  assert.match(actions, /export async function requestConnection\(/);
  assert.match(actions, /\.rpc\('request_connection'/);
  assert.match(actions, /export async function decideConnectionRequest\(/);
  assert.match(actions, /\.rpc\('decide_connection_request'/);
  assert.doesNotMatch(actions, /formData\.get\(['"](?:requester_id|recipient_id|actor_id)['"]\)/);
});

test('profile discovery is reciprocally block-aware at the database boundary', () => {
  const migration = read(migrationPath);
  assert.match(migration, /create or replace function public\.is_blocked_with_current_user\(p_other_id uuid\)/i);
  assert.match(migration, /auth\.uid\(\).*blocker_id.*blocked_id/s);
  assert.match(migration, /drop policy if exists "profiles authenticated read" on public\.profiles/i);
  assert.match(migration, /create policy "profiles block-aware read" on public\.profiles/i);
  assert.match(migration, /auth\.uid\(\).*id.*is_blocked_with_current_user\(id\)/s);
});

test('blocking is atomic with active-relationship severance and cannot be bypassed by direct insert', () => {
  const migration = read(migrationPath);
  const actions = read('apps/web/app/app/actions.js');
  assert.match(migration, /status in \('pending', 'accepted', 'declined', 'cancelled', 'blocked'\)/i);
  assert.match(migration, /create or replace function public\.block_user\(p_blocked_id uuid\)/i);
  assert.match(migration, /insert into public\.blocks.*v_blocker_id.*p_blocked_id/s);
  assert.match(migration, /update public\.connection_requests.*status = 'blocked'.*status in \('pending', 'accepted'\)/s);
  assert.match(migration, /drop policy if exists "blocks own insert" on public\.blocks/i);
  assert.match(migration, /revoke all on function public\.block_user\(uuid\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.block_user\(uuid\) to authenticated/i);
  assert.match(actions, /export async function blockMember\([\s\S]*?\.rpc\('block_user'/);
  assert.doesNotMatch(actions, /from\('blocks'\)\.upsert/);
});

test('blocked pairs cannot inspect connection rows while block is active', () => {
  const migration = read(migrationPath);
  assert.match(migration, /create policy "connection participants read"[\s\S]*is_blocked_with_current_user/i);
});
