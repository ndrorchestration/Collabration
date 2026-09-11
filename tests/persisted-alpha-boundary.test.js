import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('SSR proxy validates claims and propagates non-cacheable refresh responses', () => {
  const proxyLib = read('apps/web/lib/supabase/proxy.js');
  const proxyEntry = read('apps/web/proxy.js');
  assert.match(proxyLib, /getClaims\(/);
  assert.match(proxyLib, /Cache-Control/);
  assert.match(proxyLib, /private, no-store/);
  assert.match(proxyEntry, /updateSession/);
});

test('PKCE callback exchanges code for session and rejects protocol-relative next paths', () => {
  const callback = read('apps/web/app/auth/callback/route.js');
  assert.match(callback, /exchangeCodeForSession\(/);
  assert.match(callback, /startsWith\('\/'\)/);
  assert.match(callback, /startsWith\('\/\/'\)/);
});

test('persisted social writes derive the actor from validated claims', () => {
  const actions = read('apps/web/app/app/actions.js');
  assert.match(actions, /getClaims\(/);
  assert.match(actions, /claims\.sub/);
  assert.doesNotMatch(actions, /formData\.get\(['\"](?:author|author_id|owner|owner_id|approver|approver_id|user_id)['\"]\)/);
  assert.match(actions, /create_space_with_owner/);
});

test('authenticated app surface is dynamic and uses persisted data actions', () => {
  const page = read('apps/web/app/app/page.js');
  assert.match(page, /force-dynamic/);
  assert.match(page, /createPost/);
  assert.match(page, /createSpace/);
  assert.match(page, /joinSpace/);
});

test('RLS hardening gates writes by membership and moderator authority', () => {
  const migration = read('supabase/migrations/20260911034500_persisted_alpha_hardening.sql');
  assert.match(migration, /space_memberships/);
  assert.match(migration, /role in \('moderator','admin'\)/);
  assert.match(migration, /create or replace function public\.create_space_with_owner/);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /drop policy if exists "approval human insert"/);
  assert.match(migration, /post sources author insert/);
});

test('governed agent/provenance writes remain unavailable to ordinary clients', () => {
  const migration = read('supabase/migrations/20260911034500_persisted_alpha_hardening.sql');
  assert.doesNotMatch(migration, /create policy[^;]+agent_actions[^;]+for insert/is);
  assert.doesNotMatch(migration, /create policy[^;]+provenance_records[^;]+for insert/is);
});
