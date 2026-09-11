'use client';

import { useMemo, useState } from 'react';
import { deriveTrustContext } from '@intellectro/social-core';
import { demoFeed } from '../lib/demo-data';
import { createDemoUiAdapter } from '../lib/ui-adapters/demo';
import { CommunityStatePanel } from './community-state-panel';
import { ModeratorQueue } from './moderator-queue';

function metricsFor(feed, claimResponses) {
  return feed.reduce((metrics, post) => {
    const trust = deriveTrustContext(post);
    metrics.challenges += trust.challenges;
    metrics.qualifications += trust.qualifications;
    metrics.unresolvedQuestions += trust.unresolvedQuestions;
    if (post.kind === 'ai_assisted' && trust.humanApproved === false) metrics.awaitingApproval += 1;
    if (post.kind === 'source_linked' && post.sourceIds.length > 0) metrics.sourceLinkedPosts += 1;
    if (post.kind === 'human') metrics.humanPosts += 1;
    return metrics;
  }, {
    challenges: 0,
    qualifications: 0,
    unresolvedQuestions: 0,
    awaitingApproval: 0,
    sourceLinkedPosts: 0,
    humanPosts: 0,
    claimResponses: claimResponses.length
  });
}

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
  const claimResponses = demoFeed.flatMap((post) => adapter.claimResponsesForPost(post.id));
  const metrics = metricsFor(demoFeed, claimResponses);
  const pending = pendingFromFeed(demoFeed);
  const decisions = adapter.approvals();

  async function decide(actionId, decision) {
    adapter.actions.decideAgentAction(actionId, decision);
    setVersion((value) => value + 1);
  }

  return (
    <>
      <CommunityStatePanel metrics={metrics} />
      <ModeratorQueue pending={pending} recentDecisions={decisions} onDecision={decide} mode="demo" />
      <section className="side-card">
        <p className="eyebrow">How to read Intellectro</p>
        <ol className="read-list">
          <li>Read normally.</li>
          <li>Notice lightweight context chips.</li>
          <li>Open context when trust matters.</li>
          <li>Challenge, qualify, or add evidence in the appropriate governed context.</li>
        </ol>
      </section>
    </>
  );
}
