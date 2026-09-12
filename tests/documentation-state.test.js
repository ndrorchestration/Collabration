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

test('MVP roadmap marks repository and relationship database evidence without promoting external gates', () => {
  const roadmap = read('docs/mvp-roadmap.md');
  assert.match(roadmap, /\[x\] Add basic reactions/);
  assert.match(roadmap, /\[x\] Add report, block, and mute/);
  assert.match(roadmap, /\[x\] Add person-to-person connection-request lifecycle/);
  assert.match(roadmap, /\[x\] Establish repository-level block\/privacy precedence/);
  assert.match(roadmap, /\[x\] Add permission inspector/);
  assert.match(roadmap, /\[x\] Add action-log viewer/);
  assert.match(roadmap, /\[x\] Add correction \/ appeal flow/);
  assert.match(roadmap, /\[x\] Moderator review queue/);
  assert.match(roadmap, /\[x\] Agent action\/audit persistence/);
  assert.match(roadmap, /\[x\] Apply the pre-relationship canonical migrations to an isolated Intellectro Supabase project and pass the multi-user RLS verification gate/);
  assert.match(roadmap, /\[x\] Apply and live-verify the connection-relationship migration against the dedicated Intellectro Supabase project/);
  assert.match(roadmap, /\[x\] Live multi-user relationship\/RLS and privacy\/block-precedence probes/);
  assert.match(roadmap, /\[ \] Pass the production browser OTP\/PKCE\/session verification gate/);
  assert.match(roadmap, /\[ \] Exercise real model-backed product loop/);
});

test('live verification evidence binds relationship admission while preserving fail-closed browser state', () => {
  const live = read('docs/supabase-live-verification.md');
  const evidence = read('docs/evidence/supabase-live-verification-2026-09-11.md');
  const completion = read('docs/alpha-completion-gates.md');
  assert.match(live, /DATABASE\/RLS COMPLETION CANDIDATE PASSED · BROWSER AUTH\/SESSION GATE PENDING/);
  assert.match(live, /20260911060000_connection_relationships\.sql/);
  assert.match(live, /stale.*accept/i);
  assert.match(evidence, /26586406e33c00b77f76aad4cf72b7ec811069c6/);
  assert.match(evidence, /20260911092212.*connection_relationships/);
  assert.match(evidence, /probe_auth_users.*0|synthetic `auth\.users`: 0/i);
  assert.match(completion, /Database\/RLS.*PASS/is);
  assert.match(completion, /Runtime.*NOT VERIFIED/is);
  assert.match(completion, /Operations.*NOT VERIFIED/is);
  assert.match(completion, /Evaluation.*NOT VERIFIED/is);
  assert.match(completion, /Alpha Complete.*NO/is);
});

test('Space invitation live admission is durably recorded without promoting Browser Gate B', () => {
  const roadmap = read('docs/mvp-roadmap.md');
  const live = read('docs/supabase-live-verification.md');
  const invitationEvidence = read('docs/evidence/supabase-space-invitations-live-verification-2026-09-11.md');

  assert.match(roadmap, /\[x\] Space invitations with explicit acceptance\/revocation/);
  assert.match(roadmap, /\[x\] Minimal shared work object: research question\/project/);
  assert.match(roadmap, /\[x\] Minimal task\/artifact\/outcome representation/);
  assert.match(live, /20260911062000_space_invitations\.sql/);
  assert.match(live, /20260912004221.*space_invitations/);
  assert.match(live, /Browser Gate B.*NOT VERIFIED/is);
  assert.match(invitationEvidence, /9a474c15ea7cb453e1d7384ed3a772c21c5c815d/);
  assert.match(invitationEvidence, /13\/13/);
  assert.match(invitationEvidence, /probe_users.*0/i);
  assert.match(invitationEvidence, /anon_execute=false/i);
});
