import test from 'node:test';
import assert from 'node:assert/strict';
import * as social from '../src/index.js';

const createdAt = '2026-09-11T08:50:00.000Z';
const decidedAt = '2026-09-11T08:55:00.000Z';
const endedAt = '2026-09-11T09:00:00.000Z';

test('connection requests start pending between two distinct humans', () => {
  assert.equal(typeof social.createConnectionRequest, 'function');

  const request = social.createConnectionRequest({
    id: 'connection-1',
    requesterId: 'user-a',
    recipientId: 'user-b',
    createdAt
  });

  assert.deepEqual(request, {
    id: 'connection-1',
    requesterId: 'user-a',
    recipientId: 'user-b',
    status: 'pending',
    createdAt,
    decidedAt: null
  });
  assert.ok(Object.isFrozen(request));
  assert.throws(() => social.createConnectionRequest({ id: 'self', requesterId: 'user-a', recipientId: 'user-a', createdAt }), /different users/i);
});

test('only the recipient may accept or decline and only the requester may cancel', () => {
  assert.equal(typeof social.transitionConnectionRequest, 'function');
  const request = social.createConnectionRequest({ id: 'connection-1', requesterId: 'user-a', recipientId: 'user-b', createdAt });

  assert.equal(social.transitionConnectionRequest(request, { actorId: 'user-b', decision: 'accepted', decidedAt }).status, 'accepted');
  assert.equal(social.transitionConnectionRequest(request, { actorId: 'user-b', decision: 'declined', decidedAt }).status, 'declined');
  assert.equal(social.transitionConnectionRequest(request, { actorId: 'user-a', decision: 'cancelled', decidedAt }).status, 'cancelled');

  assert.throws(() => social.transitionConnectionRequest(request, { actorId: 'user-a', decision: 'accepted', decidedAt }), /recipient/i);
  assert.throws(() => social.transitionConnectionRequest(request, { actorId: 'user-b', decision: 'cancelled', decidedAt }), /requester/i);
  assert.throws(() => social.transitionConnectionRequest({ ...request, status: 'accepted', decidedAt }, { actorId: 'user-b', decision: 'declined', decidedAt }), /pending/i);
});

test('either participant may disconnect an accepted connection without rewriting its acceptance time', () => {
  assert.equal(typeof social.disconnectAcceptedConnection, 'function');
  const request = social.createConnectionRequest({ id: 'connection-1', requesterId: 'user-a', recipientId: 'user-b', createdAt });
  const accepted = social.transitionConnectionRequest(request, { actorId: 'user-b', decision: 'accepted', decidedAt });

  for (const actorId of ['user-a', 'user-b']) {
    const disconnected = social.disconnectAcceptedConnection(accepted, { actorId, endedAt });
    assert.equal(disconnected.status, 'disconnected');
    assert.equal(disconnected.decidedAt, decidedAt);
    assert.equal(disconnected.endedAt, endedAt);
  }

  assert.throws(() => social.disconnectAcceptedConnection(accepted, { actorId: 'user-c', endedAt }), /participant/i);
  assert.throws(() => social.disconnectAcceptedConnection(request, { actorId: 'user-a', endedAt }), /accepted/i);
});

test('block precedence defeats discovery, invitations, and new connections in either direction', () => {
  assert.equal(typeof social.evaluateConnectionAccess, 'function');

  for (const blocks of [
    [{ blockerId: 'user-a', blockedId: 'user-b' }],
    [{ blockerId: 'user-b', blockedId: 'user-a' }]
  ]) {
    assert.deepEqual(social.evaluateConnectionAccess({ viewerId: 'user-a', targetId: 'user-b', blocks }), {
      blocked: true,
      discoverable: false,
      canInvite: false,
      canConnect: false
    });
  }

  assert.deepEqual(social.evaluateConnectionAccess({ viewerId: 'user-a', targetId: 'user-b', blocks: [] }), {
    blocked: false,
    discoverable: true,
    canInvite: true,
    canConnect: true
  });
});

test('mute does not silently become a block or revoke social authority', () => {
  const access = social.evaluateConnectionAccess({
    viewerId: 'user-a',
    targetId: 'user-b',
    blocks: [],
    mutes: [{ muterId: 'user-a', mutedId: 'user-b' }]
  });

  assert.equal(access.blocked, false);
  assert.equal(access.discoverable, true);
  assert.equal(access.canInvite, true);
  assert.equal(access.canConnect, true);
});
