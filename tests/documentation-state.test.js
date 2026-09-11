import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('README reflects admitted dedicated Supabase database state', () => {
  const readme = read('README.md');
  assert.doesNotMatch(readme, /migrations have not yet been applied to an isolated Intellectro Supabase project/i);
  assert.match(readme, /database\/RLS.*verified/i);
  assert.match(readme, /browser auth\/session.*NOT VERIFIED/i);
});

test('MVP roadmap records database admission as complete but browser auth as pending', () => {
  const roadmap = read('docs/mvp-roadmap.md');
  assert.match(roadmap, /\[x\] Apply migrations to an isolated Intellectro Supabase project and pass the multi-user RLS verification gate/);
  assert.match(roadmap, /\[ \] Pass the production browser OTP\/PKCE\/session verification gate/);
});

test('live verification and alpha completion gate preserve fail-closed state', () => {
  const live = read('docs/supabase-live-verification.md');
  const completion = read('docs/alpha-completion-gates.md');
  assert.match(live, /DATABASE GATES PASSED · BROWSER AUTH\/SESSION GATE PENDING/);
  assert.match(completion, /Runtime.*NOT VERIFIED/is);
  assert.match(completion, /Evaluation.*NOT VERIFIED/is);
  assert.match(completion, /Alpha Complete.*NO/is);
});
