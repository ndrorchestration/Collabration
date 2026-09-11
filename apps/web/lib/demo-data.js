import { createSocialPost, chronologicalFeed } from '@intellectro/social-core';

export const demoSpace = Object.freeze({ id: 'space-ai-governance', slug: 'ai-governance-lab', name: 'AI Governance Lab', description: 'A working Space for accountable AI systems, evidence, evaluation, and community governance.', memberCount: 128, mode: 'demo' });

const posts = [
  createSocialPost({ id: 'post-001', authorId: 'user-ender', text: 'Agent authority should be visible at the moment a user needs to decide whether to trust an automated action.', kind: 'source_linked', sourceIds: ['source-001','source-002'], aiAssistance: { type: 'claim_extraction', agentId: 'claim-agent-1', humanApproved: true }, disputeSummary: { challenges: 2, qualifications: 3, unresolvedQuestions: 1 }, createdAt: '2026-09-11T02:30:00Z' }),
  createSocialPost({ id: 'post-002', authorId: 'user-maya', text: 'A provenance badge should tell me where something came from, not imply that the claim is true.', kind: 'human', sourceIds: [], disputeSummary: { challenges: 0, qualifications: 1, unresolvedQuestions: 0 }, createdAt: '2026-09-11T01:45:00Z' }),
  createSocialPost({ id: 'post-003', authorId: 'user-jon', text: 'This week’s community summary is ready for moderator review. It was generated from 14 posts and cannot publish until a human approves it.', kind: 'ai_assisted', sourceIds: ['post-ref-1','post-ref-2','post-ref-3'], aiAssistance: { type: 'community_summary', agentId: 'community-agent-1', humanApproved: false }, disputeSummary: { challenges: 0, qualifications: 0, unresolvedQuestions: 2 }, createdAt: '2026-09-11T00:50:00Z' })
];

export const demoFeed = chronologicalFeed(posts);
export const demoAuthors = Object.freeze({
  'user-ender': { displayName: 'Ender', handle: '@ender', role: 'Space moderator' },
  'user-maya': { displayName: 'Maya Chen', handle: '@mayac', role: 'Researcher' },
  'user-jon': { displayName: 'Jon Bell', handle: '@jonb', role: 'Community member' }
});
