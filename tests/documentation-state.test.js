import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('README reflects admitted database state and implemented alpha-completion repository surface', () => {
  const readme = read('README.md');
  assert.doesNotMatch(readme, /migrations have not yet been applied to an isolated Intellectro Supabase project/i);
  assert.match(readme, /database\/RLS.*verified/i);
  assert.match(readme, /browser auth\/session.*NOT VERIFIED/i);
  assert.doesNotMatch(readme, /Moderator review UI, a trusted governed writer for agent action\/provenance records, correction\/appeal workflow.*remain planned work/i);
  assert.match(readme, /permission inspector/i);
  assert.match(readme, /correction\/appeal/i);
  assert.match(readme, /governed action/i);
});

test('MVP roadmap marks repository-complete alpha features done while preserving external gates', () => {
  const roadmap = read('docs/mvp-roadmap.md');
  assert.match(roadmap, /\[x\] Add basic reactions/);
  assert.match(roadmap, /\[x\] Add report, block, and mute/);
  assert.match(roadmap, /\[x\] Add permission inspector/);
  assert.match(roadmap, /\[x\] Add action-log viewer/);
  assert.match(roadmap, /\[x\] Add correction \/ appeal flow/);
  assert.match(roadmap, /\[x\] Moderator review queue/);
  assert.match(roadmap, /\[x\] Agent action\/audit persistence/);
  assert.match(roadmap, /\[x\] Apply migrations to an isolated Intellectro Supabase project and pass the multi-user RLS verification gate/);
  assert.match(roadmap, /\[ \] Pass the production browser OTP\/PKCE\/session verification gate/);
  assert.match(roadmap, /\[ \] Exercise real model-backed product loop/);
});

test('live verification and alpha completion gate preserve fail-closed state', () => {
  const live = read('docs/supabase-live-verification.md');
  const completion = read('docs/alpha-completion-gates.md');
  assert.match(live, /DATABASE\/RLS COMPLETION CANDIDATE PASSED · BROWSER AUTH\/SESSION GATE PENDING/);
  assert.match(completion, /Database\/RLS.*PASS/is);
  assert.match(completion, /Runtime.*NOT VERIFIED/is);
  assert.match(completion, /Operations.*NOT VERIFIED/is);
  assert.match(completion, /Evaluation.*NOT VERIFIED/is);
  assert.match(completion, /Alpha Complete.*NO/is);
});
