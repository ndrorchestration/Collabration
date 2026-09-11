import test from 'node:test';
import assert from 'node:assert/strict';
import { assertActionEvent, createActionEvent } from '../src/index.js';

const base = { action_id: 'act-1', actor_id: 'agent-community-1', owner_id: 'user-1', action: 'summarize', scope: 'space:alpha', policy_version: 'alpha-0.1', capabilities_used: ['summarize'], approval_status: 'not_required', timestamp: '2026-09-11T02:00:00.000Z' };

test('action events require accountable attribution fields', () => {
  const event = createActionEvent(base);
  assert.equal(assertActionEvent(event), true);
  assert.equal(event.event_type, 'agent_action');
});

test('action event creation rejects missing owner', () => {
  const { owner_id, ...missingOwner } = base;
  assert.throws(() => createActionEvent(missingOwner), /owner_id/);
});

test('action events are immutable at the top level', () => {
  assert.equal(Object.isFrozen(createActionEvent(base)), true);
});
