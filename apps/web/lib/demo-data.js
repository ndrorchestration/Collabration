import { createSocialPost, chronologicalFeed } from '@collabration/social-core';

export const demoSpace = Object.freeze({
  id: 'space-ai-governance',
  slug: 'ai-governance-lab',
  name: 'AI Governance Lab',
  description: 'A working Space for accountable AI systems, evidence, evaluation, and community governance.',
  memberCount: 128,
  mode: 'demo'
});

const posts = [
  createSocialPost({
    id: 'post-001',
    authorId: 'user-ender',
    text: 'Agent authority should be visible at the moment a user needs to decide whether to trust an automated action.',
    kind: 'source_linked',
    sourceIds: ['source-001', 'source-002'],
    aiAssistance: { type: 'claim_extraction', agentId: 'claim-agent-1', humanApproved: true },
    disputeSummary: { challenges: 2, qualifications: 3, unresolvedQuestions: 1 },
    createdAt: '2026-09-11T02:30:00Z'
  }),
  createSocialPost({
    id: 'post-002',
    authorId: 'user-maya',
    text: 'A provenance badge should tell me where something came from, not imply that the claim is true.',
    kind: 'human',
    sourceIds: [],
    disputeSummary: { challenges: 0, qualifications: 1, unresolvedQuestions: 0 },
    createdAt: '2026-09-11T01:45:00Z'
  }),
  createSocialPost({
    id: 'post-003',
    authorId: 'user-jon',
    text: "This week's community summary is ready for moderator review. It was generated from 14 posts and cannot publish until a human approves it.",
    kind: 'ai_assisted',
    sourceIds: ['post-ref-1', 'post-ref-2', 'post-ref-3'],
    aiAssistance: { type: 'community_summary', agentId: 'community-agent-1', humanApproved: false },
    disputeSummary: { challenges: 0, qualifications: 0, unresolvedQuestions: 2 },
    createdAt: '2026-09-11T00:50:00Z'
  }),
  createSocialPost({
    id: 'post-004',
    authorId: 'user-maya',
    text: 'I challenged the community summary because two of the cited posts were edited after the summary was generated. The provenance record still shows the original inputs.',
    kind: 'source_linked',
    sourceIds: ['post-003'],
    disputeSummary: { challenges: 1, qualifications: 0, unresolvedQuestions: 1 },
    createdAt: '2026-09-10T23:10:00Z'
  }),
  createSocialPost({
    id: 'post-005',
    authorId: 'user-jon',
    text: 'Here is the source I used for the governance kernel claim: the capability matrix defines deny-by-default, and the action-event schema records owner, capability, and approval status.',
    kind: 'source_linked',
    sourceIds: ['source-004', 'source-005'],
    aiAssistance: null,
    disputeSummary: { challenges: 0, qualifications: 0, unresolvedQuestions: 0 },
    createdAt: '2026-09-10T21:20:00Z'
  })
];

export const demoFeed = chronologicalFeed(posts);

export const demoAuthors = Object.freeze({
  'user-ender': Object.freeze({
    id: 'user-ender',
    displayName: 'Ender',
    handle: '@ender',
    role: 'Space moderator',
    bio: 'Ender chairs the AI Governance Lab and writes about provenance, accountability, and the moment a user has to decide whether to trust an automated action.'
  }),
  'user-maya': Object.freeze({
    id: 'user-maya',
    displayName: 'Maya Chen',
    handle: '@mayac',
    role: 'Researcher',
    bio: 'Maya researches provenance design and argues that a badge should say where something came from, not whether the claim is true.'
  }),
  'user-jon': Object.freeze({
    id: 'user-jon',
    displayName: 'Jon Bell',
    handle: '@jonb',
    role: 'Community member',
    bio: 'Jon follows the alpha closely and keeps the group honest about what the governance kernel actually commits to.'
  })
});
