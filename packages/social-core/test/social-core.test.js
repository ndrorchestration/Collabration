import test from 'node:test';
import assert from 'node:assert/strict';
import { createSocialPost, createClaimResponse, chronologicalFeed, deriveTrustContext } from '../src/index.js';

test('source-linked posts require at least one source id', () => {
  assert.throws(() => createSocialPost({ id: 'post-1', authorId: 'user-1', text: 'Claim', kind: 'source_linked', sourceIds: [], createdAt: '2026-09-11T03:00:00Z' }), /source/i);
});

test('claim responses are limited to governed contextual types', () => {
  for (const type of ['support', 'challenge', 'qualify', 'add_evidence', 'ask_question']) {
    assert.equal(createClaimResponse({ id: `r-${type}`, postId: 'post-1', authorId: 'user-2', type, text: 'context' }).type, type);
  }
  assert.throws(() => createClaimResponse({ id: 'r-bad', postId: 'post-1', authorId: 'user-2', type: 'true', text: 'vote' }), /response type/i);
});

test('chronologicalFeed sorts newest first without mutating input', () => {
  const older = createSocialPost({ id: 'older', authorId: 'u', text: 'older', kind: 'human', createdAt: '2026-09-11T01:00:00Z' });
  const newer = createSocialPost({ id: 'newer', authorId: 'u', text: 'newer', kind: 'human', createdAt: '2026-09-11T02:00:00Z' });
  const input = [older, newer];
  const result = chronologicalFeed(input);
  assert.deepEqual(result.map((post) => post.id), ['newer', 'older']);
  assert.deepEqual(input.map((post) => post.id), ['older', 'newer']);
  assert.ok(Object.isFrozen(result));
});

test('trust context distinguishes authorship, AI assistance, evidence, and disputes', () => {
  const post = createSocialPost({ id: 'post-1', authorId: 'user-1', text: 'Governance should be inspectable.', kind: 'source_linked', sourceIds: ['source-1', 'source-2'], aiAssistance: { type: 'claim_extraction', agentId: 'claim-agent-1', humanApproved: true }, disputeSummary: { challenges: 2, qualifications: 1, unresolvedQuestions: 1 }, createdAt: '2026-09-11T03:00:00Z' });
  const trust = deriveTrustContext(post);
  assert.equal(trust.authorship, 'human');
  assert.equal(trust.aiAssisted, true);
  assert.equal(trust.aiAssistanceType, 'claim_extraction');
  assert.equal(trust.humanApproved, true);
  assert.equal(trust.sourceCount, 2);
  assert.equal(trust.disputed, true);
  assert.equal(trust.unresolvedQuestions, 1);
});
