import test from 'node:test';
import assert from 'node:assert/strict';
import { decideCapability, validateAgentPrincipal } from '../src/index.js';

const principal = { id: 'agent-community-1', type: 'agent', ownerId: 'user-1' };
const policy = { version: 'alpha-0.1', capabilities: { summarize: 'allow', draft_comment: 'approval_required', request_escalation: 'allow', grant_escalation: 'deny' } };

test('unknown capabilities are denied by default', () => {
  const result = decideCapability({ principal, capability: 'delete', policy });
  assert.equal(result.decision, 'deny');
  assert.equal(result.reason, 'capability_not_granted');
});

test('ownerless agents are rejected', () => {
  assert.throws(() => validateAgentPrincipal({ id: 'agent-x', type: 'agent' }), /accountable owner/);
});

test('approval-required capability remains blocked without approval', () => {
  assert.equal(decideCapability({ principal, capability: 'draft_comment', policy }).decision, 'approval_required');
});

test('approval-required capability allows after explicit human approval', () => {
  const result = decideCapability({ principal, capability: 'draft_comment', policy, approval: { approved: true, approverType: 'human', approverId: 'user-1' } });
  assert.equal(result.decision, 'allow');
  assert.equal(result.reason, 'human_approval_recorded');
});

test('agents cannot grant themselves escalation', () => {
  assert.equal(decideCapability({ principal, capability: 'grant_escalation', policy }).decision, 'deny');
});
