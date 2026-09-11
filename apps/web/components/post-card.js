import { deriveTrustContext } from '@intellectro/social-core';
import { TrustChip } from './trust-chip';
import { ContextResponseBar } from './context-response-bar';

export function PostCard({ post, author }) {
  const trust = deriveTrustContext(post);
  return (
    <article className="post-card">
      <header className="post-header">
        <div className="avatar" aria-hidden="true">{author.displayName.slice(0, 1)}</div>
        <div><strong>{author.displayName}</strong><div className="muted">{author.handle} · {author.role}</div></div>
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
        <button type="button" className="link-button">Inspect action log</button>
      </details>
      <ContextResponseBar />
    </article>
  );
}
