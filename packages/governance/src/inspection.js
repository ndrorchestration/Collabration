import { policyForAgent, validateCapabilityMatrix } from './matrix.js';

function freezeInspection(value) {
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) Object.freeze(item);
      Object.freeze(child);
    } else if (child && typeof child === 'object') {
      Object.freeze(child);
    }
  }
  return Object.freeze(value);
}

export function buildPermissionInspection(matrix, agentType, additionalCapabilities = []) {
  validateCapabilityMatrix(matrix);
  const policy = policyForAgent(matrix, agentType);
  if (!Array.isArray(additionalCapabilities)) throw new TypeError('additionalCapabilities must be an array');

  const capabilities = Object.entries(policy.capabilities).map(([capability, decision]) => ({
    capability,
    decision,
    declared: true
  }));

  const declared = new Set(capabilities.map((item) => item.capability));
  for (const capability of additionalCapabilities) {
    if (typeof capability !== 'string' || !capability.trim()) throw new TypeError('capability names must be non-empty strings');
    if (!declared.has(capability)) {
      capabilities.push({ capability, decision: matrix.default, declared: false });
      declared.add(capability);
    }
  }

  return freezeInspection({
    version: matrix.version,
    agentType,
    defaultDecision: matrix.default,
    capabilities,
    rateLimits: policy.rateLimits,
    executionClaim: false
  });
}
