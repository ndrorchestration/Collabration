const POST_KINDS = new Set(['human', 'source_linked', 'ai_assisted']);
const RESPONSE_TYPES = new Set(['support', 'challenge', 'qualify', 'add_evidence', 'ask_question']);
const CONNECTION_DECISIONS = new Set(['accepted', 'declined', 'cancelled']);

function requireText(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} is required`);
  return value.trim();
}

function requireDateTime(value, name) {
  const normalized = requireText(value, name);
  if (Number.isNaN(Date.parse(normalized))) throw new TypeError(`${name} must be an ISO date-time`);
  return normalized;
}

export function createConnectionRequest({ id, requesterId, recipientId, createdAt }) {
  const normalizedId = requireText(id, 'id');
  const requester = requireText(requesterId, 'requesterId');
  const recipient = requireText(recipientId, 'recipientId');
  const created = requireDateTime(createdAt, 'createdAt');
  if (requester === recipient) throw new Error('connection request requires different users');

  return Object.freeze({
    id: normalizedId,
    requesterId: requester,
    recipientId: recipient,
    status: 'pending',
    createdAt: created,
    decidedAt: null
  });
}

export function transitionConnectionRequest(request, { actorId, decision, decidedAt }) {
  if (!request || typeof request !== 'object') throw new TypeError('connection request is required');
  if (request.status !== 'pending') throw new Error('connection request must be pending');
  const actor = requireText(actorId, 'actorId');
  const normalizedDecision = requireText(decision, 'decision');
  const decided = requireDateTime(decidedAt, 'decidedAt');
  if (!CONNECTION_DECISIONS.has(normalizedDecision)) throw new TypeError(`unsupported connection decision: ${normalizedDecision}`);

  if (normalizedDecision === 'cancelled') {
    if (actor !== request.requesterId) throw new Error('only the requester may cancel a connection request');
  } else if (actor !== request.recipientId) {
    throw new Error('only the recipient may accept or decline a connection request');
  }

  return Object.freeze({ ...request, status: normalizedDecision, decidedAt: decided });
}

export function disconnectAcceptedConnection(connection, { actorId, endedAt }) {
  if (!connection || typeof connection !== 'object') throw new TypeError('connection is required');
  if (connection.status !== 'accepted') throw new Error('connection must be accepted');
  const actor = requireText(actorId, 'actorId');
  const ended = requireDateTime(endedAt, 'endedAt');
  if (actor !== connection.requesterId && actor !== connection.recipientId) {
    throw new Error('only a connection participant may disconnect');
  }
  return Object.freeze({ ...connection, status: 'disconnected', endedAt: ended });
}

export function evaluateConnectionAccess({ viewerId, targetId, blocks = [] }) {
  const viewer = requireText(viewerId, 'viewerId');
  const target = requireText(targetId, 'targetId');
  if (viewer === target) throw new Error('connection access requires different users');
  if (!Array.isArray(blocks)) throw new TypeError('blocks must be an array');

  const blocked = blocks.some((entry) => entry && (
    (entry.blockerId === viewer && entry.blockedId === target)
    || (entry.blockerId === target && entry.blockedId === viewer)
  ));

  return Object.freeze({
    blocked,
    discoverable: !blocked,
    canInvite: !blocked,
    canConnect: !blocked
  });
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
