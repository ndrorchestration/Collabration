import { deriveTrustContext } from '@intellectro/social-core';
import { TrustChip } from './trust-chip';
import { ContextResponseBar } from './context-response-bar';
import { ProfileHover } from './profile-hover';
import { ReactionBar } from './reaction-bar';
import { CommentThread } from './comment-thread';
import { ClaimResponseComposer } from './claim-response-composer';
import { SourceLinker } from './source-linker';

function assistanceLabel(type) {
  const labels = {
    community_summary: 'AI summarized',
    claim_extraction: 'AI extracted claims',
    source_linking: 'AI linked sources',
    draft_public_content: 'AI drafted',
    draft_annotation: 'AI drafted annotation'
  };
  return labels[type] ?? `AI assisted · ${String(type ?? 'unspecified').replaceAll('_', ' ')}`;
}

export function PostCard({
  post,
  author,
  viewer = null,
  reactionState = null,
  comments = [],
  claimResponses = [],
  sources = [],
  onToggleReaction,
  onAddComment,
  onAddClaimResponse,
  onAddSource,
  onInspectActionLog,
  mode = 'demo'
}) {
  const trust = deriveTrustContext(post);
  const pendingAgentOutput = post.kind === 'ai_assisted' && trust.humanApproved === false;
  const interactive = Boolean(viewer) && !pendingAgentOutput;

  return (
    <article className={`post-card${pendingAgentOutput ? ' post-card--pending' : ''}`}>
      <header className="post-header">
        <div className="avatar" aria-hidden="true">{author.displayName.slice(0, 1)}</div>
        <ProfileHover author={author} bio={author.bio} />
        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}</time>
      </header>
      <p className="post-copy">{post.text}</p>
      <div className="trust-row" aria-label="Trust context">
        <TrustChip tone="human">Human-authored</TrustChip>
        {trust.sourceCount > 0 && <TrustChip tone="source">Source-linked · {trust.sourceCount}</TrustChip>}
        {trust.aiAssisted && <TrustChip tone="ai">{assistanceLabel(trust.aiAssistanceType)}</TrustChip>}
        {trust.aiAssisted && trust.humanApproved === true && <TrustChip tone="human">Human approved</TrustChip>}
        {pendingAgentOutput && <TrustChip tone="dispute">Awaiting approval</TrustChip>}
        {trust.disputed && <TrustChip tone="dispute">Community context</TrustChip>}
      </div>
      <details className="context-panel">
        <summary>View context</summary>
        <dl>
          <div><dt>Created by</dt><dd>{author.displayName} ({author.handle})</dd></div>
          <div><dt>AI role</dt><dd>{trust.aiAssisted ? assistanceLabel(trust.aiAssistanceType) : 'None'}</dd></div>
          <div><dt>Human approval</dt><dd>{trust.humanApproved === null ? 'Not applicable' : trust.humanApproved ? 'Confirmed' : 'Required before publication/use'}</dd></div>
          <div><dt>Evidence</dt><dd>{trust.sourceCount} linked source{trust.sourceCount === 1 ? '' : 's'}</dd></div>
          <div><dt>Community state</dt><dd>{trust.challenges} challenges · {trust.qualifications} qualifications · {trust.unresolvedQuestions} unresolved</dd></div>
        </dl>
        <p className="context-note">Provenance describes origin and transformation. It does not certify that a claim is true.</p>
        {onInspectActionLog && <button type="button" className="link-button" onClick={() => onInspectActionLog(post)}>Inspect action log</button>}
      </details>

      {interactive && reactionState && <ReactionBar counts={reactionState.counts} activeReactions={reactionState.active} onToggle={onToggleReaction} />}
      {interactive && <ContextResponseBar />}
      {interactive && onAddClaimResponse && <ClaimResponseComposer onSubmit={onAddClaimResponse} />}
      {interactive && onAddSource && <SourceLinker sources={sources} onAdd={onAddSource} mode={mode} />}
      {interactive && <CommentThread comments={comments} viewer={viewer} onSubmit={onAddComment} mode={mode} />}
      {claimResponses.length > 0 && (
        <section className="claim-response-list" aria-label="Contextual responses">
          {claimResponses.map((response) => <p className="context-note" key={response.id}><strong>{String(response.type ?? response.response_type).replaceAll('_', ' ')}:</strong> {response.text ?? response.body}</p>)}
        </section>
      )}
      {pendingAgentOutput && <p className="context-note">This illustrative agent output is pending human approval; discussion controls remain withheld until that state is resolved.</p>}
    </article>
  );
}
