import test from 'node:test';
import assert from 'node:assert/strict';
import { planCommunityAction } from '../src/index.js';

const principal = { id: 'community-agent-1', type: 'agent', ownerId: 'moderator-1' };
const policy = { version: 'alpha-0.1', capabilities: { summarize: 'allow', flag_for_review: 'allow', draft_comment: 'approval_required', publish: 'deny', delete: 'deny', ban: 'deny', change_policy: 'deny' } };

for (const action of ['publish', 'delete', 'ban', 'change_policy']) {
  test(`Community Agent cannot ${action}`, () => {
    const plan = planCommunityAction({ action, principal, policy });
    assert.equal(plan.decision.decision, 'deny');
    assert.equal(plan.execution, 'not_executed');
  });
}

test('Community Agent can prepare allowed summary work without side effects', () => {
  const plan = planCommunityAction({ action: 'summarize', principal, policy });
  assert.equal(plan.decision.decision, 'allow');
  assert.equal(plan.execution, 'not_executed');
});
