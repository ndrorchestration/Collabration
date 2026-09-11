import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../apps/web/app/app/page.js', import.meta.url), 'utf8');

test('persisted app loads block-aware people and participant-visible active connection rows', () => {
  assert.match(page, /from\('profiles'\)[\s\S]*select\('id,handle,display_name'/);
  assert.match(page, /from\('connection_requests'\)[\s\S]*select\('id,requester_id,recipient_id,status,created_at,decided_at,ended_at'\)/);
  assert.match(page, /\.in\('status', \['pending', 'accepted'\]\)/);
  assert.match(page, /incomingConnectionRequests/);
  assert.match(page, /outgoingConnectionRequests/);
  assert.match(page, /acceptedConnections/);
  assert.match(page, /discoverablePeople/);
});

test('people can request accept decline cancel and disconnect through server actions', () => {
  for (const action of ['requestConnection', 'decideConnectionRequest', 'disconnectConnection']) {
    assert.match(page, new RegExp(`\\b${action}\\b`));
  }
  assert.match(page, /action=\{requestConnection\}[\s\S]*name="target_user_id"/);
  assert.match(page, /action=\{decideConnectionRequest\}[\s\S]*name="request_id"[\s\S]*name="decision" value="accepted"/);
  assert.match(page, /action=\{decideConnectionRequest\}[\s\S]*name="decision" value="declined"/);
  assert.match(page, /action=\{decideConnectionRequest\}[\s\S]*name="decision" value="cancelled"/);
  assert.match(page, /action=\{disconnectConnection\}[\s\S]*name="request_id"/);
});

test('relationship UX states that connection does not grant agent or governance authority', () => {
  assert.match(page, /Connections are human social relationships/i);
  assert.match(page, /do not grant agent permissions, Space roles, or governance authority/i);
});

test('relationship UI never submits requester recipient or actor identity', () => {
  assert.doesNotMatch(page, /name="(?:requester_id|recipient_id|actor_id)"/);
});
