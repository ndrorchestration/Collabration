const VALID_DECISIONS = new Set(['allow', 'deny', 'approval_required']);

export function validateAgentPrincipal(principal) {
  if (!principal || typeof principal !== 'object') {
    throw new TypeError('principal is required');
  }
  if (!principal.id || !principal.type) {
    throw new TypeError('principal must include id and type');
  }
  if (principal.type === 'agent' && !principal.ownerId) {
    throw new Error('agent must resolve to an accountable owner');
  }
  return true;
}

export function decideCapability({ principal, capability, policy, approval = null }) {
  validateAgentPrincipal(principal);
  if (!capability) throw new TypeError('capability is required');
  if (!policy || typeof policy !== 'object' || !policy.version) {
    throw new TypeError('policy with version is required');
  }

  const configured = policy.capabilities?.[capability] ?? 'deny';
  const decision = VALID_DECISIONS.has(configured) ? configured : 'deny';

  if (decision === 'deny') {
    return Object.freeze({
      decision: 'deny',
      reason: policy.capabilities?.[capability] === undefined ? 'capability_not_granted' : 'explicitly_denied',
      capability,
      policyVersion: policy.version
    });
  }

  if (decision === 'approval_required') {
    const approvedByHuman = approval?.approved === true && approval?.approverType === 'human' && approval?.approverId;
    if (!approvedByHuman) {
      return Object.freeze({
        decision: 'approval_required',
        reason: 'human_approval_required',
        capability,
        policyVersion: policy.version
      });
    }
    return Object.freeze({
      decision: 'allow',
      reason: 'human_approval_recorded',
      capability,
      policyVersion: policy.version
    });
  }

  return Object.freeze({
    decision: 'allow',
    reason: 'capability_granted',
    capability,
    policyVersion: policy.version
  });
}
