const INVITATION_DECISIONS = new Set(['accepted', 'declined', 'revoked', 'blocked']);
const JOIN_POLICIES = new Set(['open', 'invite_only']);

function requireText(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} is required`);
  return value.trim();
}

function requireDateTime(value, name) {
  const normalized = requireText(value, name);
  if (Number.isNaN(Date.parse(normalized))) throw new TypeError(`${name} must be an ISO date-time`);
  return normalized;
}

export function createSpaceInvitation({ id, spaceId, inviterId, inviteeId, createdAt }) {
  const normalizedId = requireText(id, 'id');
  const space = requireText(spaceId, 'spaceId');
  const inviter = requireText(inviterId, 'inviterId');
  const invitee = requireText(inviteeId, 'inviteeId');
  const created = requireDateTime(createdAt, 'createdAt');
  if (inviter === invitee) throw new Error('Space invitation requires different users');

  return Object.freeze({
    id: normalizedId,
    spaceId: space,
    inviterId: inviter,
    inviteeId: invitee,
    status: 'pending',
    grantedRole: 'member',
    createdAt: created,
    decidedAt: null
  });
}

export function transitionSpaceInvitation(invitation, { actorId, decision, decidedAt }) {
  if (!invitation || typeof invitation !== 'object') throw new TypeError('Space invitation is required');
  if (invitation.status !== 'pending') throw new Error('Space invitation must be pending');
  const actor = requireText(actorId, 'actorId');
  const normalizedDecision = requireText(decision, 'decision');
  const decided = requireDateTime(decidedAt, 'decidedAt');
  if (!INVITATION_DECISIONS.has(normalizedDecision)) throw new TypeError(`unsupported invitation decision: ${normalizedDecision}`);

  if (normalizedDecision === 'accepted' || normalizedDecision === 'declined') {
    if (actor !== invitation.inviteeId) throw new Error('only the invitee may accept or decline a Space invitation');
  } else if (normalizedDecision === 'revoked') {
    if (actor !== invitation.inviterId) throw new Error('only the inviter may revoke a Space invitation');
  } else if (actor !== invitation.inviterId && actor !== invitation.inviteeId) {
    throw new Error('only an invitation participant may record block terminalization');
  }

  return Object.freeze({ ...invitation, status: normalizedDecision, decidedAt: decided });
}

export function evaluateSpaceJoin({ joinPolicy, blocked = false, acceptedInvitation = false }) {
  const policy = requireText(joinPolicy, 'joinPolicy');
  if (!JOIN_POLICIES.has(policy)) throw new TypeError(`unsupported join policy: ${policy}`);
  if (blocked === true) return Object.freeze({ allowed: false, reason: 'blocked' });
  if (policy === 'open') return Object.freeze({ allowed: true, reason: 'open_space' });
  if (acceptedInvitation === true) return Object.freeze({ allowed: true, reason: 'accepted_invitation' });
  return Object.freeze({ allowed: false, reason: 'invitation_required' });
}
