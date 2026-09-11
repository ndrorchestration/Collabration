import { decideCapability } from '../../../packages/governance/src/index.js';

export function planCommunityAction({ action, principal, policy, approval = null }) {
  const decision = decideCapability({ principal, capability: action, policy, approval });
  return Object.freeze({ agentType: 'community_agent', action, decision, execution: 'not_executed' });
}
