import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('review panel renders existing governed review state without querying data', () => {
  const review = read('apps/web/components/review-panel.js');
  assert.match(review, /pendingActions/);
  assert.match(review, /openCorrections/);
  assert.match(review, /agentActions/);
  assert.match(review, /permissionInspections/);
  assert.doesNotMatch(review, /createClient|supabase|from\('/);
});

test('spaces panel binds human Space access actions without taking on governed-review authority', () => {
  const spaces = read('apps/web/components/spaces-panel.js');
  for (const action of [
    'createSpace',
    'joinSpace',
    'inviteToSpace',
    'decideSpaceInvitation',
    'revokeSpaceInvitation',
    'setSpaceJoinPolicy'
  ]) {
    assert.match(spaces, new RegExp(`\\b${action}\\b`));
  }
  assert.match(spaces, /do not grant moderator, admin, agent, or governance authority/i);
  assert.doesNotMatch(spaces, /decideAgentAction|requestAgentAction|approval_records|Permission inspector|Moderator review queue/);
});
