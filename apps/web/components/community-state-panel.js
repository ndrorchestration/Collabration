'use client';

import { demoFeed, demoAuthors } from '../lib/demo-data';
import { deriveTrustContext } from '@intellectro/social-core';
import { demoStore } from '../lib/demo-store';

export function CommunityStatePanel() {
  const state = demoStore.get();

  let totalChallenges = 0;
  let totalQualifications = 0;
  let totalUnresolvedQuestions = 0;
  let awaitingApproval = 0;
  let sourceLinkedPosts = 0;
  let humanPosts = 0;

  for (const post of demoFeed) {
    const trust = deriveTrustContext(post);
    totalChallenges += trust.challenges;
    totalQualifications += trust.qualifications;
    totalUnresolvedQuestions += trust.unresolvedQuestions;

    if (post.kind === 'ai_assisted' && !post.aiAssistance?.humanApproved) {
      awaitingApproval += 1;
    }
    if (post.kind === 'source_linked' && post.sourceIds.length > 0) {
      sourceLinkedPosts += 1;
    }
    if (post.kind === 'human') {
      humanPosts += 1;
    }
  }

  // Also count sources attached via claim responses in the demo store.
  const claimResponseSourceCount = state.claimResponses.length;

  return (
    <section className="side-card community-state-panel">
      <p className="eyebrow">Governance pulse</p>
      <h2>Context, not hidden authority</h2>
      <div className="metric">
        <strong>{totalChallenges}</strong>
        <span>challenges across the feed</span>
      </div>
      <div className="metric">
        <strong>{totalQualifications}</strong>
        <span>qualifications across the feed</span>
      </div>
      <div className="metric">
        <strong>{totalUnresolvedQuestions}</strong>
        <span>unresolved questions across the feed</span>
      </div>
      <div className="metric">
        <strong>{awaitingApproval}</strong>
        <span>agent outputs awaiting human approval</span>
      </div>
      <div className="metric">
        <strong>{sourceLinkedPosts}</strong>
        <span>source-linked posts</span>
      </div>
      <div className="metric">
        <strong>{humanPosts}</strong>
        <span>human-authored posts</span>
      </div>
      {claimResponseSourceCount > 0 && (
        <div className="metric">
          <strong>{claimResponseSourceCount}</strong>
          <span>community claim responses</span>
        </div>
      )}
    </section>
  );
}
