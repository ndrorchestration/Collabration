'use client';

import { useMemo, useState } from 'react';
import { demoFeed } from '../lib/demo-data';
import { createDemoUiAdapter } from '../lib/ui-adapters/demo';
import { ModeratorQueue } from './moderator-queue';

function pendingFromFeed(feed) {
  return feed.flatMap((post) => {
    if (post.kind !== 'ai_assisted' || post.aiAssistance?.humanApproved !== false) return [];
    return [{
      actionId: `demo-action-${post.id}`,
      action: String(post.aiAssistance.type).replaceAll('_', ' '),
      policyVersion: '0.1.0-alpha'
    }];
  });
}

export function DemoGovernanceRail() {
  const [version, setVersion] = useState(0);
  const adapter = useMemo(() => createDemoUiAdapter(), [version]);
  const decisions = adapter.approvals().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const decidedActionIds = new Set(decisions.map((decision) => decision.actionId));
  const pending = pendingFromFeed(demoFeed).filter((item) => !decidedActionIds.has(item.actionId));

  async function decide(actionId, decision) {
    adapter.actions.decideAgentAction(actionId, decision);
    setVersion((value) => value + 1);
  }

  return (
    <section className="side-card">
      <p className="eyebrow">Why Intellectro is different</p>
      <h2>Trust context stays close without taking over the conversation.</h2>
      <p className="context-note">AI participation is labeled, sources remain inspectable, and consequential agent output keeps an explicit human-review state.</p>
      <details className="compact-review">
        <summary>Illustrative review · {pending.length} pending</summary>
        <p className="context-note">Demo decisions are browser-local examples. They do not represent authenticated approval or persisted authority.</p>
        <ModeratorQueue pending={pending} recentDecisions={decisions} onDecision={decide} mode="demo" />
      </details>
    </section>
  );
}
