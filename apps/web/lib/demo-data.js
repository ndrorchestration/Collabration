import { createSocialPost, chronologicalFeed } from '@intellectro/social-core';

export const demoSpace = Object.freeze({
  id: 'space-ai-governance',
  slug: 'ai-governance-lab',
  name: 'AI Governance Lab',
  description:
    'A working Space for accountable AI systems, evidence, evaluation, and community governance.',
  memberCount: 128,
  mode: 'demo',
});

const posts = [
  createSocialPost({
    id: 'post-001',
    authorId: 'user-ender',
    text: 'Agent authority should be visible at the moment a user needs to decide whether to trust an automated action.',
    kind: 'source_linked',
    sourceIds: ['source-001', 'source-002'],
    aiAssistance: {
      type: 'claim_extraction',
      agentId: 'claim-agent-1',
      humanApproved: true,
    },
    disputeSummary: {
      challenges: 2,
      qualifications: 3,
      unresolvedQuestions: 1,
    },
    createdAt: '2026-09-11T02:30:00Z',
  }),

  createSocialPost({
    id: 'post-002',
    authorId: 'user-maya',
    text: 'A provenance badge should tell me where something came from, not imply that the claim is true.',
    kind: 'human',
    sourceIds: [],
    disputeSummary: {
      challenges: 0,
      qualifications: 1,
      unresolvedQuestions: 0,
    },
    createdAt: '2026-09-11T01:45:00Z',
  }),

  createSocialPost({
    id: 'post-003',
    authorId: 'user-jon',
    text: "This week's community summary is ready for moderator review. It was generated from 14 posts and cannot publish until a human approves it.",
    kind: 'ai_assisted',
    sourceIds: ['post-ref-1', 'post-ref-2', 'post-ref-3'],
    aiAssistance: {
      type: 'community_summary',
      agentId: 'community-agent-1',
      humanApproved: false,
    },
    disputeSummary: {
      challenges: 0,
      qualifications: 0,
      unresolvedQuestions: 2,
    },
    createdAt: '2026-09-11T00:50:00Z',
  }),

  createSocialPost({
    id: 'post-004',
    authorId: 'user-maya',
    text: 'I challenged the community summary because two of the cited posts were edited after the summary was generated. The provenance record still shows the original inputs.',
    kind: 'source_linked',
    sourceIds: ['post-003'],
    disputeSummary: {
      challenges: 1,
      qualifications: 0,
      unresolvedQuestions: 1,
    },
    createdAt: '2026-09-10T23:10:00Z',
  }),

  createSocialPost({
    id: 'post-005',
    authorId: 'user-jon',
    text: 'Here is the source I used for the governance kernel claim: the capability matrix defines deny-by-default, and the action-event schema records owner, capability, and approval status.',
    kind: 'source_linked',
    sourceIds: ['source-004', 'source-005'],
    aiAssistance: null,
    disputeSummary: {
      challenges: 0,
      qualifications: 0,
      unresolvedQuestions: 0,
    },
    createdAt: '2026-09-10T21:20:00Z',
  }),
];

export const demoFeed = chronologicalFeed(posts);

export const demoAuthors = Object.freeze({
  'user-ender': {
    displayName: 'Ender',
    handle: '@ender',
    role: 'Space moderator',
    id: 'user-ender',
    bio: 'Ender chairs the AI Governance Lab and writes about provenance, accountability, and the moment a user has to decide whether to trust an automated action.',
  },
  'user-maya': {
    displayName: 'Maya Chen',
    handle: '@mayac',
    role: 'Researcher',
    id: 'user-maya',
    bio: 'Maya researches provenance design and argues that a badge should say where something came from, not whether the claim is true.',
  },
  'user-jon': {
    displayName: 'Jon Bell',
    handle: '@jonb',
    role: 'Community member',
    id: 'user-jon',
    bio: 'Jon follows the alpha closely and keeps the group honest about what the governance kernel actually commits to.',
  },
});

export const demoComments = {
  'post-001': [
    {
      id: 'comment-001a',
      authorId: 'user-maya',
      displayName: 'Maya Chen',
      handle: '@mayac',
      body: 'This is the part I keep returning to. The moment of decision is where trust either becomes legible or becomes folklore.',
      createdAt: '2026-09-11T02:45:00Z',
    },
    {
      id: 'comment-001b',
      authorId: 'user-jon',
      displayName: 'Jon Bell',
      handle: '@jonb',
      body: 'Agreed. If the UI only surfaces agent authority when someone goes looking for it, most people will never see it.',
      createdAt: '2026-09-11T02:52:00Z',
    },
  ],
  'post-002': [
    {
      id: 'comment-002a',
      authorId: 'user-ender',
      displayName: 'Ender',
      handle: '@ender',
      body: 'Exactly. Provenance is a map of where a thing came from and what happened to it. It is not a verdict.',
      createdAt: '2026-09-11T01:55:00Z',
    },
  ],
  'post-004': [
    {
      id: 'comment-004a',
      authorId: 'user-ender',
      displayName: 'Ender',
      handle: '@ender',
      body: 'Good challenge. The unresolved question here is whether the summary should have been versioned against the post edits before review.',
      createdAt: '2026-09-10T23:30:00Z',
    },
  ],
};
