import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('social safety writes derive the acting user from authenticated claims', () => {
  const actions = read('apps/web/app/app/actions.js');
  for (const name of ['setReaction', 'removeReaction', 'reportPost', 'blockMember', 'unblockMember', 'muteMember', 'unmuteMember']) {
    assert.match(actions, new RegExp(`export async function ${name}\\(`));
  }
  assert.doesNotMatch(actions, /formData\.get\(['"](?:user_id|reporter_id|blocker_id|muter_id)['"]\)/);
  assert.match(actions, /claims\.sub/);
  assert.match(actions, /SUPPORTED_REACTIONS/);
  assert.match(actions, /SUPPORTED_REPORT_REASONS/);
});

test('persisted app renders reaction report block and mute controls', () => {
  const page = read('apps/web/app/app/page.js');
  assert.match(page, /setReaction/);
  assert.match(page, /reportPost/);
  assert.match(page, /blockMember/);
  assert.match(page, /muteMember/);
  assert.match(page, /reactions\(user_id,reaction\)/);
});

test('blocked and muted authors are filtered from feed and nested discussion', () => {
  const page = read('apps/web/app/app/page.js');
  assert.match(page, /blockedIds/);
  assert.match(page, /mutedIds/);
  assert.match(page, /excludedAuthorIds/);
  assert.match(page, /filterVisibleDiscussion/);
});

test('reaction hardening requires Space membership and preserves browser actor binding', () => {
  const migration = read('supabase/migrations/20260911050000_social_safety_hardening.sql');
  assert.match(migration, /drop policy if exists "reactions own insert"/);
  assert.match(migration, /create policy "reactions member insert"/);
  assert.match(migration, /auth\.uid\(\).*user_id/s);
  assert.match(migration, /is_space_member\(p\.space_id\)/);
  assert.doesNotMatch(migration, /service_role/);
});
