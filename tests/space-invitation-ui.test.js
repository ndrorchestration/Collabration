import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('apps/web/app/app/page.js');
const spaces = read('apps/web/components/spaces-panel.js');

test('authenticated page loads join policies and participant-visible pending invitations', () => {
  assert.match(page, /from\('spaces'\)[\s\S]*select\('id,slug,name,description,join_policy,created_at'\)/);
  assert.match(page, /from\('space_invitations'\)[\s\S]*select\('id,space_id,inviter_id,invitee_id,granted_role,status,created_at,decided_at'\)/);
  assert.match(page, /\.eq\('status', 'pending'\)/);
  assert.match(page, /incomingSpaceInvitations/);
  assert.match(page, /outgoingSpaceInvitations/);
});

test('Spaces panel distinguishes open join from invite-only access', () => {
  assert.match(spaces, /space\.join_policy === 'open'/);
  assert.match(spaces, /action=\{joinSpace\}/);
  assert.match(spaces, /Invite only/);
});

test('incoming invitations expose accept and decline only through controlled actions', () => {
  assert.match(spaces, /Incoming invitations/);
  assert.match(spaces, /action=\{decideSpaceInvitation\}/);
  assert.match(spaces, /name="invitation_id"/);
  assert.match(spaces, /name="decision" value="accepted"/);
  assert.match(spaces, /name="decision" value="declined"/);
});

test('Space admins can set join policy, invite discoverable people, and revoke pending invitations', () => {
  assert.match(spaces, /action=\{setSpaceJoinPolicy\}/);
  assert.match(spaces, /name="join_policy"/);
  assert.match(spaces, /action=\{inviteToSpace\}/);
  assert.match(spaces, /name="invitee_id"/);
  assert.match(spaces, /action=\{revokeSpaceInvitation\}/);
  assert.match(spaces, /Sent invitations/);
});

test('admin invitation controls render only for invite-only Spaces', () => {
  assert.match(spaces, /space\.join_policy === 'invite_only'\s*&&\s*invitablePeople\.length > 0\s*&&\s*\(/);
});

test('invitation UI never submits inviter, actor, or membership role identity', () => {
  assert.doesNotMatch(spaces, /name="(?:inviter_id|actor_id|role)"/);
});

test('authenticated page composes invitation data/actions into SpacesPanel', () => {
  for (const prop of [
    'incomingSpaceInvitations',
    'outgoingSpaceInvitations',
    'inviteToSpace',
    'decideSpaceInvitation',
    'revokeSpaceInvitation',
    'setSpaceJoinPolicy'
  ]) {
    assert.match(page, new RegExp(`\\b${prop}\\b`));
  }
});
