import test from 'node:test';
import assert from 'node:assert/strict';
import { buildClaimAnalysisDraft } from '../src/index.js';

const principal = { id: 'claim-agent-1', type: 'agent', ownerId: 'moderator-1' };
const policy = { version: 'alpha-0.1', capabilities: { extract_claims: 'allow', publish: 'deny' } };

test('Claim Agent drafts source-grounded analysis requiring human approval', () => {
  const draft = buildClaimAnalysisDraft({ text: 'A source-linked statement.', sourceIds: ['source-1'], principal, policy, generatedAt: '2026-09-11T02:00:00.000Z' });
  assert.equal(draft.publicationStatus, 'human_approval_required');
  assert.equal(draft.humanApproval, null);
  assert.deepEqual(draft.provenance.sourceObjects, ['source-1']);
});

test('Claim Agent cannot self-mark a draft approved', () => {
  const draft = buildClaimAnalysisDraft({ text: 'A source-linked statement.', sourceIds: ['source-1'], principal, policy, generatedAt: '2026-09-11T02:00:00.000Z', humanApproval: { approved: true, approverType: 'agent', approverId: 'claim-agent-1' } });
  assert.equal(draft.humanApproval, null);
  assert.equal(draft.publicationStatus, 'human_approval_required');
});
