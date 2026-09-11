import { decideCapability, validateAgentPrincipal } from '../../../packages/governance/src/index.js';
import { createProvenanceRecord } from '../../../packages/provenance/src/index.js';

export function buildClaimAnalysisDraft({ text, sourceIds, principal, policy, generatedAt, humanApproval = null }) {
  validateAgentPrincipal(principal);
  if (!text || typeof text !== 'string') throw new TypeError('text is required');

  const decision = decideCapability({ principal, capability: 'extract_claims', policy });
  if (decision.decision !== 'allow') throw new Error(`claim analysis denied: ${decision.reason}`);

  const provenance = createProvenanceRecord({ sourceObjects: sourceIds, transformations: ['extract_claims'], generatedAt });
  const approvedByHuman = humanApproval?.approved === true && humanApproval?.approverType === 'human' && Boolean(humanApproval?.approverId);

  return Object.freeze({
    agentType: 'claim_agent',
    text,
    provenance,
    governanceDecision: decision,
    publicationStatus: approvedByHuman ? 'approved' : 'human_approval_required',
    humanApproval: approvedByHuman ? Object.freeze({ ...humanApproval }) : null
  });
}
