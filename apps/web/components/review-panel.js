function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function ReviewPanel({
  pendingActions = [],
  openCorrections = [],
  correctionRequests = [],
  agentActions = [],
  permissionInspections = [],
  decideAgentAction,
  requestCorrectionOrAppeal,
  resolveCorrectionOrAppeal
}) {
  return (
    <section className="product-view review-panel" aria-labelledby="review-heading">
      <header className="view-header">
        <p className="eyebrow">Review</p>
        <h1 id="review-heading">Governed review work</h1>
        <p>Human decisions update governed records only. Approval does not execute a model, establish truth, or publish output by itself.</p>
      </header>

      <section className="view-section" aria-labelledby="pending-actions-heading">
        <h2 id="pending-actions-heading">Pending agent actions · {pendingActions.length}</h2>
        {pendingActions.length === 0 && <p className="empty-state">No pending governed actions.</p>}
        {pendingActions.map((action) => (
          <form action={decideAgentAction} className="review-row" key={action.id}>
            <input type="hidden" name="action_id" value={action.id} />
            <div>
              <strong>{action.agent_id.replaceAll('_', ' ')}</strong>
              <p className="context-note">{action.capability.replaceAll('_', ' ')} · policy {action.policy_version}</p>
            </div>
            <div className="review-row__decision">
              <select name="decision" defaultValue="approved"><option value="approved">Approve</option><option value="rejected">Reject</option></select>
              <textarea name="note" placeholder="Decision note · optional" />
              <button type="submit" className="primary-button">Record decision</button>
            </div>
          </form>
        ))}
      </section>

      <section className="view-section" aria-labelledby="corrections-heading">
        <h2 id="corrections-heading">Corrections and appeals · {openCorrections.length} open</h2>
        {correctionRequests.length === 0 && <p className="empty-state">No correction or appeal requests are visible for this Space.</p>}
        {correctionRequests.map((request) => (
          <article className="review-row" key={request.id}>
            <div>
              <strong>{request.request_kind} · {request.status}</strong>
              <p>{request.request_text}</p>
              <p className="context-note">Target: {request.post_id ? `post ${request.post_id.slice(0, 8)}` : `action ${request.action_id?.slice(0, 8)}`}</p>
              {request.resolution_note && <p className="context-note">Resolution: {request.resolution_note}</p>}
            </div>
            {request.status === 'open' && (
              <form action={resolveCorrectionOrAppeal} className="review-row__decision">
                <input type="hidden" name="request_id" value={request.id} />
                <select name="status" defaultValue="accepted"><option value="accepted">Accept</option><option value="rejected">Reject</option><option value="resolved">Resolve without acceptance/rejection</option></select>
                <textarea name="resolution_note" placeholder="Human resolution note" />
                <button type="submit" className="primary-button">Resolve request</button>
              </form>
            )}
          </article>
        ))}
      </section>

      <details className="view-section">
        <summary>Governed action history · {agentActions.length}</summary>
        <p className="context-note">This history is read-only and constrained by database RLS.</p>
        {agentActions.length === 0 && <p className="empty-state">No governed agent actions are visible for this Space.</p>}
        {agentActions.map((action) => (
          <div className="review-history-row" key={action.id}>
            <strong>{action.agent_id.replaceAll('_', ' ')}</strong>
            <p className="context-note">{action.capability.replaceAll('_', ' ')} · {action.approval_status} · policy {action.policy_version} · {formatDate(action.created_at)}</p>
            {(action.approval_records ?? []).map((approval) => <p className="context-note" key={approval.id}>Human decision: {approval.decision}</p>)}
            <form action={requestCorrectionOrAppeal} className="login-form">
              <input type="hidden" name="action_id" value={action.id} />
              <input type="hidden" name="request_kind" value="appeal" />
              <textarea name="request_text" placeholder="Request review of this governed action. The original record remains unchanged." required />
              <button type="submit" className="secondary-button">Request appeal</button>
            </form>
          </div>
        ))}
      </details>

      <details className="view-section">
        <summary>Permission inspector</summary>
        <p className="context-note">Permission does not mean an action occurred. Unknown capabilities default to deny.</p>
        {permissionInspections.map((inspection) => (
          <div className="permission-group" key={inspection.agentType}>
            <strong>{inspection.agentType.replace('_', ' ')}</strong>
            <span className="context-note"> · policy {inspection.version}</span>
            {inspection.capabilities.map((item) => <p className="context-note" key={item.capability}>{item.capability.replaceAll('_', ' ')} · <strong>{item.decision}</strong></p>)}
          </div>
        ))}
      </details>
    </section>
  );
}
