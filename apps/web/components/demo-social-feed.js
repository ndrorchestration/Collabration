'use client';

import { useMemo, useState } from 'react';
import { demoAuthors, demoFeed, demoSpace } from '../lib/demo-data';
import { createDemoUiAdapter } from '../lib/ui-adapters/demo';
import { PostCard } from './post-card';
import { ActionLogViewer } from './action-log-viewer';

function demoActionsFromFeed() {
  return demoFeed.flatMap((post) => {
    const assistance = post.aiAssistance;
    if (!assistance) return [];
    return [{
      action_id: `demo-action-${post.id}`,
      actor_id: assistance.agentId,
      action: String(assistance.type).replaceAll('_', ' '),
      policy_version: '0.1.0-alpha',
      capabilities_used: assistance.type === 'community_summary' ? ['summarize_space'] : ['extract_claims'],
      approval_status: assistance.humanApproved === true ? 'approved' : assistance.humanApproved === false ? 'pending' : 'not_required'
    }];
  });
}

export function DemoSocialFeed() {
  const [version, setVersion] = useState(0);
  const [actionLogOpen, setActionLogOpen] = useState(false);
  const adapter = useMemo(() => createDemoUiAdapter(), [version]);
  const demoActions = useMemo(() => demoActionsFromFeed(), []);

  function mutate(operation) {
    return async (...args) => {
      await operation(...args);
      setVersion((value) => value + 1);
    };
  }

  return (
    <>
      {demoFeed.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          author={demoAuthors[post.authorId]}
          viewer={adapter.viewer}
          reactionState={adapter.reactionStateForPost(post.id)}
          comments={adapter.commentsForPost(post.id)}
          claimResponses={adapter.claimResponsesForPost(post.id)}
          sources={adapter.sources()}
          onToggleReaction={mutate((reaction) => adapter.actions.toggleReaction(post.id, reaction))}
          onAddComment={mutate((body) => adapter.actions.addComment(post.id, body))}
          onAddClaimResponse={mutate((type, body) => adapter.actions.addClaimResponse(post.id, type, body))}
          onAddSource={mutate((source) => adapter.actions.addSource(source))}
          onInspectActionLog={() => setActionLogOpen(true)}
          mode="demo"
        />
      ))}
      <ActionLogViewer
        open={actionLogOpen}
        onClose={() => setActionLogOpen(false)}
        actions={demoActions}
        approvalRecords={[]}
        mode="demo"
        spaceName={demoSpace.name}
      />
    </>
  );
}
