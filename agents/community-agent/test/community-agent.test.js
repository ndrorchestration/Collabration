import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadCapabilityMatrix, policyForAgent } from '../../../packages/governance/src/index.js';
import { planCommunityAction } from '../src/index.js';

const matrixText = await readFile(new URL('../../../governance/capability-matrix.yaml', import.meta.url), 'utf8');
const policy = policyForAgent(loadCapabilityMatrix(matrixText), 'community_agent');
const principal = { id: 'community-agent-1', type: 'agent', ownerId: 'moderator-1' };

for (const action of ['delete_content', 'ban_user', 'change_policy', 'create_or_invite_agent', 'grant_capability']) {
  test(`Community Agent cannot ${action}`, () => {
    const plan = planCommunityAction({ action, principal, policy });
    assert.equal(plan.decision.decision, 'deny');
    assert.equal(plan.execution, 'not_executed');
  });
}

test('Community Agent can prepare canonical summary work without side effects', () => {
  const plan = planCommunityAction({ action: 'summarize_space', principal, policy });
  assert.equal(plan.decision.decision, 'allow');
  assert.equal(plan.execution, 'not_executed');
});

test('Community Agent public publication remains human-approval-gated', () => {
  const pending = planCommunityAction({ action: 'publish_public_content', principal, policy });
  assert.equal(pending.decision.decision, 'approval_required');
  assert.equal(pending.execution, 'not_executed');

  const approved = planCommunityAction({
    action: 'publish_public_content',
    principal,
    policy,
    approval: { approved: true, approverType: 'human', approverId: 'moderator-1' }
  });
  assert.equal(approved.decision.decision, 'allow');
  assert.equal(approved.execution, 'not_executed');
});

test('legacy Community Agent capability aliases fail closed', () => {
  for (const alias of ['summarize', 'draft_comment', 'publish', 'delete', 'ban']) {
    const plan = planCommunityAction({ action: alias, principal, policy });
    assert.equal(plan.decision.decision, 'deny');
    assert.equal(plan.decision.reason, 'capability_not_granted');
  }
});
