import YAML from 'yaml';

const VALID_DECISIONS = new Set(['allow', 'deny', 'approval_required']);
const REQUIRED_TRUE_PRINCIPLES = [
  'accountable_owner_required',
  'typed_capability_required',
  'public_action_attribution_required',
  'high_impact_action_requires_reversibility_or_approval',
  'automated_actions_rate_limited',
  'preserve_ai_transformation_provenance',
  'policy_version_required_for_moderation'
];
const REQUIRED_DENY_CONSTRAINTS = [
  'autonomous_public_posting',
  'autonomous_banning',
  'autonomous_deletion',
  'autonomous_policy_change'
];
const WINDOW_PATTERN = /^\d+(s|m|h|d)$/;

function assertObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export function validateCapabilityMatrix(matrix) {
  assertObject(matrix, 'capability matrix');
  if (typeof matrix.version !== 'string' || !matrix.version.trim()) {
    throw new TypeError('capability matrix version is required');
  }
  if (matrix.default !== 'deny') {
    throw new Error('capability matrix default must be deny');
  }

  assertObject(matrix.principles, 'principles');
  for (const principle of REQUIRED_TRUE_PRINCIPLES) {
    if (matrix.principles[principle] !== true) {
      throw new Error(`principle ${principle} must be true`);
    }
  }
  if (matrix.principles.self_escalation !== 'deny') {
    throw new Error('self_escalation must be deny');
  }

  assertObject(matrix.agents, 'agents');
  if (Object.keys(matrix.agents).length === 0) throw new Error('at least one agent policy is required');

  for (const [agentType, agent] of Object.entries(matrix.agents)) {
    assertObject(agent, `agent ${agentType}`);
    if (agent.owner_required !== true) throw new Error(`${agentType} owner_required must be true`);
    assertObject(agent.capabilities, `${agentType} capabilities`);

    for (const [capability, decision] of Object.entries(agent.capabilities)) {
      if (!VALID_DECISIONS.has(decision)) {
        throw new Error(`invalid capability decision for ${agentType}.${capability}: ${String(decision)}`);
      }
    }
    if (agent.capabilities.grant_capability !== 'deny') {
      throw new Error(`${agentType} grant_capability must be deny`);
    }

    if (agent.rate_limits !== undefined) {
      assertObject(agent.rate_limits, `${agentType} rate_limits`);
      for (const [limitName, limit] of Object.entries(agent.rate_limits)) {
        assertObject(limit, `${agentType} rate limit ${limitName}`);
        if (!Number.isInteger(limit.max_actions) || limit.max_actions <= 0) {
          throw new Error(`${agentType}.${limitName} max_actions must be a positive integer`);
        }
        if (typeof limit.window !== 'string' || !WINDOW_PATTERN.test(limit.window)) {
          throw new Error(`${agentType}.${limitName} window must use <number><s|m|h|d>`);
        }
      }
    }
  }

  assertObject(matrix.alpha_constraints, 'alpha_constraints');
  for (const constraint of REQUIRED_DENY_CONSTRAINTS) {
    if (matrix.alpha_constraints[constraint] !== 'deny') {
      throw new Error(`${constraint} must be deny during alpha`);
    }
  }

  return true;
}

export function loadCapabilityMatrix(text) {
  if (typeof text !== 'string' || !text.trim()) throw new TypeError('capability matrix YAML text is required');
  const parsed = YAML.parse(text);
  validateCapabilityMatrix(parsed);
  return deepFreeze(parsed);
}

export function policyForAgent(matrix, agentType) {
  validateCapabilityMatrix(matrix);
  if (typeof agentType !== 'string' || !agentType) throw new TypeError('agentType is required');
  const agent = matrix.agents[agentType];
  if (!agent) throw new Error(`unknown agent type: ${agentType}`);
  return deepFreeze({
    version: matrix.version,
    agentType,
    capabilities: { ...agent.capabilities },
    rateLimits: agent.rate_limits ? structuredClone(agent.rate_limits) : {}
  });
}
