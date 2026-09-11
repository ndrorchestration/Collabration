'use client';

export function ModeratorQueue({ pending = [], recentDecisions = [], onDecision, mode = 'demo' }) {
  return (
    <section className="side-card moderator-queue">
      <p className="eyebrow">Moderator queue</p>
      <h2>Approvals awaiting review</h2>
      {pending.length === 0 && recentDecisions.length === 0 && <p className="muted">No pending governed actions.</p>}
      {pending.length > 0 && (
        <>
          <p className="moderator-queue__subhead">Pending ({pending.length})</p>
          {pending.map((item) => (
            <div key={item.actionId ?? item.id} className="moderator-queue__row">
              <div className="moderator-queue__agent">
                <span className="muted">agent</span>
                <div>
                  <div className="moderator-queue__action">{item.action}</div>
                  <div className="moderator-queue__policy">policy {item.policyVersion ?? item.policy_version}</div>
                </div>
              </div>
              {onDecision && (
                <div className="moderator-queue__actions">
                  <button type="button" className="secondary-button" onClick={() => onDecision(item.actionId ?? item.id, 'approved')}>Approve</button>
                  <button type="button" className="link-button" onClick={() => onDecision(item.actionId ?? item.id, 'rejected')}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
      {recentDecisions.length > 0 && (
        <>
          <div className="rail-divider" />
          <p className="moderator-queue__subhead">Recent decisions</p>
          {recentDecisions.map((decision) => (
            <div key={`${decision.actionId ?? decision.action_id}-${decision.createdAt ?? decision.created_at}`} className="moderator-queue__row">
              <div className="moderator-queue__agent">
                <span className="muted">{decision.decision}</span>
                <div>
                  <div className="moderator-queue__action">action {decision.actionId ?? decision.action_id}</div>
                  <div className="moderator-queue__policy">by {decision.approverId ?? decision.approver_id}</div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
      {mode === 'demo' && <p className="context-note">Demo decisions are illustrative browser-local state and are not persisted approval records.</p>}
    </section>
  );
}
