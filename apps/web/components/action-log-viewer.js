'use client';

const STATUS_LABEL = Object.freeze({
  not_required: 'Not required',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
});

export function ActionLogViewer({ open, onClose, actions = [], approvalRecords = [], mode = 'demo', spaceName = 'Current Space' }) {
  if (!open) return null;
  return (
    <section className="side-card action-log-viewer">
      <div className="action-log-viewer__header">
        <p className="eyebrow">Action log</p>
        <h2>Agent actions · {spaceName}</h2>
        <button type="button" className="link-button action-log-viewer__close" onClick={onClose} aria-label="Close action log">Close</button>
      </div>
      {mode === 'demo' && <p className="context-note">Demo action rows are illustrative. They are not persisted `agent_actions`, approval records, or authoritative provenance.</p>}
      <p className="action-log-viewer__subhead">Recent actions ({actions.length})</p>
      {actions.length === 0 && <p className="muted">No agent actions recorded.</p>}
      {actions.map((event) => {
        const actionId = event.action_id ?? event.id;
        const approvalStatus = event.approval_status ?? 'not_required';
        return (
          <div key={actionId} className="action-log-viewer__row">
            <div className="action-log-viewer__agent">
              <span className="muted">agent</span>
              <div><div className="action-log-viewer__action">{event.action}</div><div className="action-log-viewer__policy">policy {event.policy_version ?? event.policyVersion}</div></div>
            </div>
            <div className="action-log-viewer__status">
              <span>{STATUS_LABEL[approvalStatus] ?? approvalStatus}</span>
              <div className="action-log-viewer__refs">{(event.capabilities_used ?? [event.capability].filter(Boolean)).join(', ')}</div>
            </div>
          </div>
        );
      })}
      {approvalRecords.length > 0 && (
        <>
          <div className="rail-divider" />
          <p className="action-log-viewer__subhead">Approval records ({approvalRecords.length})</p>
          {approvalRecords.map((record) => (
            <div key={`${record.action_id ?? record.actionId}-${record.created_at ?? record.createdAt}`} className="action-log-viewer__row">
              <div className="action-log-viewer__agent"><span className="muted">{record.decision}</span><div><div className="action-log-viewer__action">action {record.action_id ?? record.actionId}</div><div className="action-log-viewer__policy">by {record.approver_id ?? record.approverId}</div></div></div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
