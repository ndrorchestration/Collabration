import { TrustChip } from './trust-chip';

export function assistanceLabel(type) {
  const labels = {
    community_summary: 'AI summarized',
    claim_extraction: 'AI extracted claims',
    source_linking: 'AI linked sources',
    draft_public_content: 'AI drafted',
    draft_annotation: 'AI drafted annotation'
  };
  return labels[type] ?? `AI assisted · ${String(type ?? 'unspecified').replaceAll('_', ' ')}`;
}

export function TrustSignals({ trust, pendingAgentOutput = false }) {
  return (
    <div className="trust-row" aria-label="Trust context">
      {trust.sourceCount > 0 && <TrustChip tone="source">Source-linked · {trust.sourceCount}</TrustChip>}
      {trust.aiAssisted && <TrustChip tone="ai">{assistanceLabel(trust.aiAssistanceType)}</TrustChip>}
      {trust.aiAssisted && trust.humanApproved === true && <TrustChip tone="human">Human approved</TrustChip>}
      {pendingAgentOutput && <TrustChip tone="dispute">Awaiting approval</TrustChip>}
      {trust.disputed && <TrustChip tone="dispute">Community context</TrustChip>}
      {trust.currentness === 'inputs_changed' && <TrustChip tone="dispute">Inputs changed</TrustChip>}
    </div>
  );
}
