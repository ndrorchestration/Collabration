'use client';

import { demoFeed } from '../lib/demo-data';
import { demoStore } from '../lib/demo-store';

function actionEventFromPost(post) {
  const ai = post.aiAssistance;
  if (!ai) return null;
  const capability = post.aiAssistance?.type === 'community_summary'
    ? ['summarize_space']
    : post.aiAssistance?.type === 'claim_extraction'
      ? ['extract_claims']
      : ['read_space_posts'];
  return {
    event_type: 'agent_action',
    action_id: `action-${post.id}`,
    actor_id: ai.agentId ?? 'unknown',
    owner_id: post.authorId,
    action: ai.type.replaceAll('_', ' '),
    scope: 'space-ai-governance',
    policy_version: '0.1.0-alpha',
    capabilities_used: capability,
    approval_status: ai.humanApproved === null ? 'not_required' : ai.humanApproved ? 'approved' : 'pending',
    timestamp: post.createdAt,
  };
}

const STATUS_LABEL = {
  not_required: 'Not required',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_TONE = {
  not_required: 'muted',
  pending: 'warn',
  approved: 'accent',
  rejected: 'muted',
};

export function ActionLogViewer({ open, onClose }) {
  if (!open) return null;

  const state = demoStore.get();

  const actions = demoFeed
    .map(actionEventFromPost)
    .filter(Boolean);

  const approvalRecords = state.approvals.map((a) => ({
    action_id: a.actionId,
    approver_id: a.approverId,
    decision: a.decision,
    note: a.note,
    created_at: a.createdAt,
  }));

  return (
    <section className="side-card action-log-viewer">
      <div className="action-log-viewer__header">
        <p className="eyebrow">Action log</p>
        <h2>Agent actions · AI Governance Lab</h2>
        <button type="button" className="link-button action-log-viewer__close" onClick={onClose} aria-label="Close action log">
          Close
        </button>
      </div>

      <p className="context-note" style={{ fontSize: '11px', marginBottom: '10px' }}>
        In demo mode, the action log is drawn from the local demo feed and browser-only approvals. Connect Supabase to read the real agent_actions and approval_records tables (owner-scoped via RLS).
      </p>

      <p className="action-log-viewer__subhead" style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 6px' }}>
        Recent actions ({actions.length})
      </p>

      {actions.length === 0 && (
        <p className="muted" style={{ fontSize: '13px' }}>No agent actions recorded.</p>
      )}

      {actions.map((evt) => (
        <div key={evt.action_id} className="action-log-viewer__row">
          <div className="action-log-viewer__agent">
            <span className="muted" style={{ fontSize: '11px' }}>agent</span>
            <div>
              <div className="action-log-viewer__action">{evt.action}</div>
              <div className="action-log-viewer__policy">policy {evt.policy_version}</div>
            </div>
          </div>
          <div className="action-log-viewer__status">
            <span className={STATUS_TONE[evt.approval_status] ?? 'muted'}>
              {STATUS_LABEL[evt.approval_status] ?? evt.approval_status}
            </span>
            <div className="action-log-viewer__refs" style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {evt.capabilities_used?.join(', ')}
            </div>
          </div>
        </div>
      ))}

      {approvalRecords.length > 0 && (
        <>
          <div className="rail-divider" style={{ margin: '14px 0 8px' }} />
          <p className="action-log-viewer__subhead" style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 6px' }}>
            Approval records ({approvalRecords.length})
          </p>
          {approvalRecords.map((rec) => (
            <div key={`${rec.action_id}-${rec.created_at}`} className="action-log-viewer__row">
              <div className="action-log-viewer__agent">
                <span className="muted" style={{ fontSize: '11px' }}>{rec.decision}</span>
                <div>
                  <div className="action-log-viewer__action">action {rec.action_id}</div>
                  <div className="action-log-viewer__policy">by {rec.approver_id}</div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
