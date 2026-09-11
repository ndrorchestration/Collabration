import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const actions = read('apps/web/app/app/actions.js');
const callback = read('apps/web/app/auth/callback/route.js');
const lifecycle = read('supabase/migrations/20260911052000_governed_action_lifecycle.sql');
const provenance = read('supabase/migrations/20260911054000_provenance_receipt_boundary.sql');
const correction = read('supabase/migrations/20260911056000_correction_appeal.sql');
const safety = read('supabase/migrations/20260911050000_social_safety_hardening.sql');
const hardening = read('supabase/migrations/20260911034500_persisted_alpha_hardening.sql');
const matrix = read('governance/capability-matrix.yaml');
const page = read('apps/web/app/app/page.js');
const threat = read('docs/threat-model-social-slice.md');

test('untrusted forms cannot forge author, owner, requester, or approver identity', () => {
  assert.doesNotMatch(actions, /formData\.get\(['"](?:author|author_id|owner|owner_id|approver|approver_id|requester|requester_id|user_id)['"]\)/);
  assert.match(lifecycle, /v_user_id := auth\.uid\(\)/);
  assert.match(correction, /v_user_id := auth\.uid\(\)/);
  assert.match(provenance, /v_user_id := auth\.uid\(\)/);
});

test('cross-Space moderation and replayed finalization fail closed', () => {
  assert.match(lifecycle, /public\.is_space_moderator\(v_space_id\)/);
  assert.match(lifecycle, /v_status <> 'pending'/);
  assert.match(lifecycle, /action is already finalized/);
  assert.match(correction, /public\.is_space_moderator\(v_space_id\)/);
  assert.match(correction, /v_status <> 'open'/);
  assert.match(correction, /correction request is not open/);
});

test('malformed capability identities and self-escalation remain denied', () => {
  assert.match(lifecycle, /p_agent_id = 'community_agent' and p_capability in \('draft_public_content', 'publish_public_content'\)/);
  assert.match(lifecycle, /p_agent_id = 'claim_agent' and p_capability in \('draft_annotation', 'publish_annotation'\)/);
  assert.match(lifecycle, /capability is not approval-required for this alpha agent/);
  assert.match(matrix, /self_escalation: deny/);
  assert.match(matrix, /grant_capability: deny/);
  assert.match(matrix, /autonomous_public_posting: deny/);
});

test('ordinary browser roles cannot directly create governed audit or provenance records', () => {
  assert.doesNotMatch(hardening, /create policy[^;]+agent_actions[^;]+for insert/is);
  assert.doesNotMatch(hardening, /create policy[^;]+provenance_records[^;]+for insert/is);
  assert.match(lifecycle, /revoke execute on function public\.request_governed_agent_action[^;]+from anon/i);
  assert.match(provenance, /revoke execute on function public\.record_approved_action_provenance[^;]+from anon/i);
  assert.doesNotMatch(actions, /from\('agent_actions'\)\.insert/);
  assert.doesNotMatch(actions, /from\('provenance_records'\)\.insert/);
});

test('authentication callback rejects protocol-relative redirects', () => {
  assert.match(callback, /!value\.startsWith\('\/'\)/);
  assert.match(callback, /value\.startsWith\('\/\/'\)/);
  assert.match(callback, /return '\/app'/);
});

test('block and mute stay viewer-local and never become delete or ban authority', () => {
  assert.doesNotMatch(safety, /delete from public\.posts/i);
  assert.doesNotMatch(actions, /from\('posts'\)\.delete/);
  assert.match(page, /neither silently bans or deletes/i);
  assert.match(page, /excludedAuthorIds/);
});

test('threat model reflects implemented repository controls without promoting live evidence', () => {
  assert.doesNotMatch(threat, /trusted server path that creates `agent_actions` is intentionally not implemented yet/i);
  assert.doesNotMatch(threat, /implement and test the trusted server writer for agent action\/provenance records/i);
  assert.doesNotMatch(threat, /add moderator review queue and appeal\/correction workflow/i);
  assert.match(threat, /live browser/i);
  assert.match(threat, /NOT VERIFIED/);
});
