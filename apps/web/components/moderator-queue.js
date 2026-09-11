'use client';

import { demoFeed, demoAuthors } from '../lib/demo-data';
import { demoStore } from '../lib/demo-store';

const POLICY_VERSION = '0.1.0-alpha';

const ACTION_LABELS = {
  community_summary: 'Draft community summary',
  claim_extraction: 'Extract claims',
  source_linking: 'Link sources',
};

export function ModeratorQueue({ currentUserId }) {
  const state = demoStore.get();

  const pending = demoFeed
    .filter((post) => post.kind === 'ai_assisted' && post.aiAssistance?.humanApproved === false)
    .map((post) => {
      const actionType = post.aiAssistance?.type ?? 'unknown';
      return {
        actionId: `action-${post.id}`,
        agentId: post.aiAssistance?.agentId ?? 'unknown',
        action: ACTION_LABELS[actionType] ?? actionType.replaceAll('_', ' '),
        postId: post.id,
        policyVersion: POLICY_VERSION,
      };
    });

  const recentDecisions = state.approvals
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  function handleDecision(actionId, decision) {
    demoStore.recordApproval(actionId, currentUserId, decision, 'Demo approval — browser only.');
  }

  return (
    <section className="side-card moderator-queue">
      <p className="eyebrow">Moderator queue</p>
      <h2>Approvals awaiting review</h2>

      {pending.length === 0 && recentDecisions.length === 0 && (
        <p className="muted" style={{ fontSize: '13px' }}>No pending agent outputs.</p>
      )}

      {pending.length > 0 && (
        <>
          <p className="moderator-queue__subhead" style={{ fontSize: '12px', color: 'var(--muted)', margin: '10px 0 6px' }}>
            Pending ({pending.length})
          </p>
          {pending.map((item) => (
            <div key={item.actionId} className="moderator-queue__row">
              <div className="moderator-queue__agent">
                <span className="muted" style={{ fontSize: '11px' }}>agent</span>
                <div>
                  <div className="moderator-queue__action">{item.action}</div>
                  <div className="moderator-queue__policy">policy {item.policyVersion}</div>
                </div>
              </div>
              <div className="moderator-queue__actions">
                <button
                  type="button"
                  className="secondary-button"
                  style={{ marginRight: '6px', padding: '5px 10px', fontSize: '12px' }}
                  onClick={() => handleDecision(item.actionId, 'approved')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="link-button"
                  style={{ color: 'var(--warn)' }}
                  onClick={() => handleDecision(item.actionId, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {recentDecisions.length > 0 && (
        <>
          <div className="rail-divider" style={{ margin: '14px 0 8px' }} />
          <p className="moderator-queue__subhead" style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 6px' }}>
            Recent decisions
          </p>
          {recentDecisions.map((a) => (
            <div key={`${a.actionId}-${a.createdAt}`} className="moderator-queue__row">
              <div className="moderator-queue__agent">
                <span className="muted" style={{ fontSize: '11px' }}>{a.decision}</span>
                <div>
                  <div className="moderator-queue__action">action {a.actionId}</div>
                  <div className="moderator-queue__policy">by {a.approverId}</div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      <p className="context-note" style={{ marginTop: '12px', fontSize: '11px' }}>
        In demo mode, approvals are stored in this browser only and do not update a real approval_records table.
      </p>
    </section>
  );
}
