import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadCapabilityMatrix, policyForAgent } from '../../../packages/governance/src/index.js';
import { buildClaimAnalysisDraft } from '../src/index.js';

const matrixText = await readFile(new URL('../../../governance/capability-matrix.yaml', import.meta.url), 'utf8');
const policy = policyForAgent(loadCapabilityMatrix(matrixText), 'claim_agent');
const principal = { id: 'claim-agent-1', type: 'agent', ownerId: 'moderator-1' };

test('Claim Agent drafts source-grounded analysis using canonical matrix policy', () => {
  const draft = buildClaimAnalysisDraft({
    text: 'A source-linked statement.',
    sourceIds: ['source-1'],
    principal,
    policy,
    generatedAt: '2026-09-11T02:00:00.000Z'
  });
  assert.equal(draft.governanceDecision.capability, 'extract_claims');
  assert.equal(draft.governanceDecision.policyVersion, '0.1.0-alpha');
  assert.equal(draft.publicationStatus, 'human_approval_required');
  assert.equal(draft.humanApproval, null);
  assert.deepEqual(draft.provenance.sourceObjects, ['source-1']);
});

test('Claim Agent cannot self-mark a draft approved', () => {
  const draft = buildClaimAnalysisDraft({
    text: 'A source-linked statement.',
    sourceIds: ['source-1'],
    principal,
    policy,
    generatedAt: '2026-09-11T02:00:00.000Z',
    humanApproval: { approved: true, approverType: 'agent', approverId: 'claim-agent-1' }
  });
  assert.equal(draft.humanApproval, null);
  assert.equal(draft.publicationStatus, 'human_approval_required');
});

test('Claim Agent publication capability remains human-approval-gated in canonical matrix', () => {
  assert.equal(policy.capabilities.publish_annotation, 'approval_required');
  assert.equal(policy.capabilities.grant_capability, 'deny');
});
