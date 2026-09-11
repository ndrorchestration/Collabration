const POST_KINDS = new Set(['human', 'source_linked', 'ai_assisted']);
const RESPONSE_TYPES = new Set(['support', 'challenge', 'qualify', 'add_evidence', 'ask_question']);

function requireText(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} is required`);
  return value.trim();
}

export function createSocialPost({ id, authorId, text, kind = 'human', sourceIds = [], aiAssistance = null, disputeSummary = null, createdAt }) {
  requireText(id, 'id');
  requireText(authorId, 'authorId');
  requireText(text, 'text');
  requireText(createdAt, 'createdAt');
  if (!POST_KINDS.has(kind)) throw new TypeError(`unsupported post kind: ${kind}`);
  if (kind === 'source_linked' && (!Array.isArray(sourceIds) || sourceIds.length === 0)) throw new TypeError('source-linked posts require at least one source');
  if (!Array.isArray(sourceIds)) throw new TypeError('sourceIds must be an array');

  const normalizedAi = aiAssistance ? Object.freeze({
    type: requireText(aiAssistance.type, 'aiAssistance.type'),
    agentId: requireText(aiAssistance.agentId, 'aiAssistance.agentId'),
    humanApproved: aiAssistance.humanApproved === true
  }) : null;

  const normalizedDisputes = disputeSummary ? Object.freeze({
    challenges: Number(disputeSummary.challenges ?? 0),
    qualifications: Number(disputeSummary.qualifications ?? 0),
    unresolvedQuestions: Number(disputeSummary.unresolvedQuestions ?? 0)
  }) : Object.freeze({ challenges: 0, qualifications: 0, unresolvedQuestions: 0 });

  return Object.freeze({ id, authorId, text, kind, sourceIds: Object.freeze([...sourceIds]), aiAssistance: normalizedAi, disputeSummary: normalizedDisputes, createdAt });
}

export function createClaimResponse({ id, postId, authorId, type, text, sourceIds = [] }) {
  requireText(id, 'id');
  requireText(postId, 'postId');
  requireText(authorId, 'authorId');
  requireText(text, 'text');
  if (!RESPONSE_TYPES.has(type)) throw new TypeError(`unsupported response type: ${type}`);
  if (!Array.isArray(sourceIds)) throw new TypeError('sourceIds must be an array');
  return Object.freeze({ id, postId, authorId, type, text, sourceIds: Object.freeze([...sourceIds]) });
}

export function chronologicalFeed(posts) {
  if (!Array.isArray(posts)) throw new TypeError('posts must be an array');
  return Object.freeze([...posts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
}

export function deriveTrustContext(post) {
  const disputes = post.disputeSummary ?? { challenges: 0, qualifications: 0, unresolvedQuestions: 0 };
  return Object.freeze({
    authorship: 'human',
    aiAssisted: Boolean(post.aiAssistance),
    aiAssistanceType: post.aiAssistance?.type ?? null,
    humanApproved: post.aiAssistance?.humanApproved ?? null,
    sourceCount: post.sourceIds?.length ?? 0,
    disputed: disputes.challenges > 0 || disputes.qualifications > 0 || disputes.unresolvedQuestions > 0,
    challenges: disputes.challenges,
    qualifications: disputes.qualifications,
    unresolvedQuestions: disputes.unresolvedQuestions
  });
}
