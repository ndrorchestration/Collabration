import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../apps/web/app/app/page.js', import.meta.url), 'utf8');
const people = readFileSync(new URL('../apps/web/components/people-panel.js', import.meta.url), 'utf8');

test('persisted app loads block-aware people and participant-visible active connection rows', () => {
  assert.match(page, /from\('profiles'\)[\s\S]*select\('id,handle,display_name'/);
  assert.match(page, /from\('connection_requests'\)[\s\S]*select\('id,requester_id,recipient_id,status,created_at,decided_at,ended_at'\)/);
  assert.match(page, /\.in\('status', \['pending', 'accepted'\]\)/);
  assert.match(page, /incomingConnectionRequests/);
  assert.match(page, /outgoingConnectionRequests/);
  assert.match(page, /acceptedConnections/);
  assert.match(page, /discoverablePeople/);
});

test('people presentation keeps connection actions on server-action props', () => {
  for (const action of ['requestConnection', 'decideConnectionRequest', 'disconnectConnection']) {
    assert.match(people, new RegExp(`\\b${action}\\b`));
  }
  assert.match(people, /action=\{requestConnection\}[\s\S]*name="target_user_id"/);
  assert.match(people, /action=\{decideConnectionRequest\}[\s\S]*name="request_id"[\s\S]*name="decision" value="accepted"/);
  assert.match(people, /action=\{decideConnectionRequest\}[\s\S]*name="decision" value="declined"/);
  assert.match(people, /action=\{decideConnectionRequest\}[\s\S]*name="decision" value="cancelled"/);
  assert.match(people, /action=\{disconnectConnection\}[\s\S]*name="request_id"/);
});

test('People view exposes existing mute and block actions without accepting actor identity', () => {
  assert.match(people, /\bmuteMember\b/);
  assert.match(people, /\bblockMember\b/);
  assert.match(people, /action=\{muteMember\}[\s\S]*name="target_user_id"/);
  assert.match(people, /action=\{blockMember\}[\s\S]*name="target_user_id"/);
  assert.match(page, /<PeoplePanel[\s\S]*muteMember=\{muteMember\}[\s\S]*blockMember=\{blockMember\}/);
});

test('relationship UX states that connection does not grant agent or governance authority', () => {
  assert.match(people, /Connections are human social relationships/i);
  assert.match(people, /do not grant agent permissions, Space roles, or governance authority/i);
});

test('relationship UI never submits requester recipient or actor identity', () => {
  assert.doesNotMatch(people, /name="(?:requester_id|recipient_id|actor_id)"/);
});

test('authenticated page composes PeoplePanel from server-derived data', () => {
  assert.match(page, /<PeoplePanel/);
  assert.match(page, /userId=\{userId\}/);
});
