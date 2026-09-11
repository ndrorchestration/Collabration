import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSpaceInvitation,
  transitionSpaceInvitation,
  evaluateSpaceJoin
} from '../packages/social-core/src/space-invitations.js';

const createdAt = '2026-09-11T10:45:00Z';
const decidedAt = '2026-09-11T10:46:00Z';

function pendingInvitation() {
  return createSpaceInvitation({
    id: 'invite-1',
    spaceId: 'space-1',
    inviterId: 'admin-1',
    inviteeId: 'user-2',
    createdAt
  });
}

test('Space invitation is immutable, pending, and grants no role above member', () => {
  const invitation = pendingInvitation();
  assert.deepEqual(invitation, {
    id: 'invite-1',
    spaceId: 'space-1',
    inviterId: 'admin-1',
    inviteeId: 'user-2',
    status: 'pending',
    grantedRole: 'member',
    createdAt,
    decidedAt: null
  });
  assert.equal(Object.isFrozen(invitation), true);
});

test('invitee may accept or decline while inviter may revoke', () => {
  const accepted = transitionSpaceInvitation(pendingInvitation(), {
    actorId: 'user-2', decision: 'accepted', decidedAt
  });
  assert.equal(accepted.status, 'accepted');
  assert.equal(accepted.grantedRole, 'member');

  const declined = transitionSpaceInvitation(pendingInvitation(), {
    actorId: 'user-2', decision: 'declined', decidedAt
  });
  assert.equal(declined.status, 'declined');

  const revoked = transitionSpaceInvitation(pendingInvitation(), {
    actorId: 'admin-1', decision: 'revoked', decidedAt
  });
  assert.equal(revoked.status, 'revoked');
});

test('wrong actor and replayed invitation decisions fail closed', () => {
  assert.throws(() => transitionSpaceInvitation(pendingInvitation(), {
    actorId: 'other-user', decision: 'accepted', decidedAt
  }), /only the invitee/i);
  assert.throws(() => transitionSpaceInvitation(pendingInvitation(), {
    actorId: 'user-2', decision: 'revoked', decidedAt
  }), /only the inviter/i);

  const accepted = transitionSpaceInvitation(pendingInvitation(), {
    actorId: 'user-2', decision: 'accepted', decidedAt
  });
  assert.throws(() => transitionSpaceInvitation(accepted, {
    actorId: 'admin-1', decision: 'revoked', decidedAt: '2026-09-11T10:47:00Z'
  }), /must be pending/i);
});

test('block terminalization is explicit and cannot be used as an acceptance surrogate', () => {
  const blocked = transitionSpaceInvitation(pendingInvitation(), {
    actorId: 'admin-1', decision: 'blocked', decidedAt
  });
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.grantedRole, 'member');
});

test('open and invite-only join policies remain distinct and block always wins', () => {
  assert.deepEqual(evaluateSpaceJoin({ joinPolicy: 'open', blocked: false, acceptedInvitation: false }), {
    allowed: true,
    reason: 'open_space'
  });
  assert.deepEqual(evaluateSpaceJoin({ joinPolicy: 'invite_only', blocked: false, acceptedInvitation: false }), {
    allowed: false,
    reason: 'invitation_required'
  });
  assert.deepEqual(evaluateSpaceJoin({ joinPolicy: 'invite_only', blocked: false, acceptedInvitation: true }), {
    allowed: true,
    reason: 'accepted_invitation'
  });
  assert.deepEqual(evaluateSpaceJoin({ joinPolicy: 'open', blocked: true, acceptedInvitation: true }), {
    allowed: false,
    reason: 'blocked'
  });
  assert.throws(() => evaluateSpaceJoin({ joinPolicy: 'private', blocked: false, acceptedInvitation: false }), /unsupported join policy/i);
});
