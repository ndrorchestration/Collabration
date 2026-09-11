import { deriveTrustContext } from '@intellectro/social-core';
import { TrustChip } from './trust-chip';
import { ContextResponseBar } from './context-response-bar';
import { CommentThread } from './comment-thread';
import { ClaimResponseComposer } from './claim-response-composer';
import { demoStore } from '../lib/demo-store';
import { demoComments, demoAuthors } from '../lib/demo-data';
import { ProfileHover } from './profile-hover';
import { ReactionBar } from './reaction-bar';
import { RESPONSE_LABEL_MAP } from '../lib/response-types';

export function PostCard({ post, author, onOpenActionLog }) {
  const trust = deriveTrustContext(post);
  const claimResponses = demoStore.get().claimResponses.filter((r) => r.postId === post.id);
  return (
    <article className="post-card">
      <header className="post-header">
        <div className="avatar" aria-hidden="true">{author.displayName.slice(0, 1)}</div>
        <div><ProfileHover author={author} bio={demoAuthors[author.id]?.bio} /></div>
        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}</time>
      </header>
      <p className="post-copy">{post.text}</p>
      <div className="trust-row" aria-label="Trust context">
        <TrustChip tone="human">Human-authored</TrustChip>
        {trust.sourceCount > 0 && <TrustChip tone="source">Source-linked · {trust.sourceCount}</TrustChip>}
        {trust.aiAssisted && <TrustChip tone="ai">AI-assisted · {trust.aiAssistanceType.replaceAll('_', ' ')}</TrustChip>}
        {trust.disputed && <TrustChip tone="dispute">Community context</TrustChip>}
      </div>
      <details className="context-panel">
        <summary>View context</summary>
        <dl>
          <div><dt>Created by</dt><dd>{author.displayName} ({author.handle})</dd></div>
          <div><dt>AI assistance</dt><dd>{trust.aiAssisted ? trust.aiAssistanceType.replaceAll('_', ' ') : 'None'}</dd></div>
          <div><dt>Human approval</dt><dd>{trust.humanApproved === null ? 'Not applicable' : trust.humanApproved ? 'Confirmed' : 'Required before publication'}</dd></div>
          <div><dt>Evidence</dt><dd>{trust.sourceCount} linked source{trust.sourceCount === 1 ? '' : 's'}</dd></div>
          <div><dt>Community state</dt><dd>{trust.challenges} challenges · {trust.qualifications} qualifications · {trust.unresolvedQuestions} unresolved</dd></div>
        </dl>
        <p className="context-note">Provenance describes origin and transformation. It does not certify that a claim is true.</p>
        <button type="button" className="link-button" onClick={onOpenActionLog}>Inspect action log</button>
      </details>
      <ContextResponseBar />
      <ReactionBar post={post} currentUserId={author.id} />
      {post.kind !== 'ai_assisted' && (
        <>
          <ClaimResponseComposer post={post} author={author} />
          {claimResponses.length > 0 && (
            <section className="response-list" aria-label="Claim responses">
              {claimResponses.map((r) => {
                const responder = demoAuthors[r.authorId];
                return (
                  <div key={r.id} className="response-item">
                    <div className="response-item__author">
                      <strong>{responder?.displayName ?? 'Unknown'}</strong>
                      <span className="muted"> · {RESPONSE_LABEL_MAP[r.type] ?? r.type}</span>
                    </div>
                    <p className="response-item__body">{r.text}</p>
                    <time className="response-item__time muted" dateTime={r.createdAt}>
                      {new Date(r.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </time>
                  </div>
                );
              })}
            </section>
          )}
          <CommentThread
            comments={demoComments[post.id] ?? []}
            author={author}
          />
        </>
      )}
    </article>
  );
}
