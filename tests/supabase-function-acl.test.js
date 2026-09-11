import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const migrationPath = 'supabase/migrations/20260911043000_function_execute_hardening.sql';

test('governed Supabase functions explicitly revoke anon execute', () => {
  assert.equal(
    existsSync(migrationPath),
    true,
    'live Supabase grants EXECUTE directly to anon; a dedicated hardening migration is required'
  );

  const sql = readFileSync(migrationPath, 'utf8');
  for (const signature of [
    'public.create_space_with_owner(text,text,text)',
    'public.create_source_linked_post(uuid,text,text,text)',
    'public.is_space_member(uuid)',
    'public.is_space_moderator(uuid)'
  ]) {
    assert.match(
      sql,
      new RegExp(`revoke\\s+execute\\s+on\\s+function\\s+${signature.replace(/[().]/g, '\\$&')}\\s+from\\s+anon`, 'i'),
      `${signature} must explicitly revoke anon EXECUTE`
    );
  }

  assert.match(
    sql,
    /grant\s+execute\s+on\s+function\s+public\.create_space_with_owner\(text,text,text\)\s+to\s+authenticated/i
  );
  assert.match(
    sql,
    /grant\s+execute\s+on\s+function\s+public\.create_source_linked_post\(uuid,text,text,text\)\s+to\s+authenticated/i
  );
});
