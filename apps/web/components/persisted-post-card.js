import { ContextDrawer } from './context-drawer';
import { TrustChip } from './trust-chip';
import { assistanceLabel } from './trust-signals';

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function PersistedPostCard({
  post,
  authorMap,
  userId,
  createComment,
  createClaimResponse,
  reportPost,
  requestCorrectionOrAppeal,
  setReaction,
  removeReaction,
  muteMember,
  blockMember
}) {
  const author = authorMap[post.author_id];
  const sourceLinks = (post.post_sources ?? []).filter((link) => link.sources);
  const reactionCounts = (post.reactions ?? []).reduce(
    (counts, row) => ({ ...counts, [row.reaction]: (counts[row.reaction] ?? 0) + 1 }),
    {}
  );
  const ownReactions = new Set((post.reactions ?? []).filter((row) => row.user_id === userId).map((row) => row.reaction));
  const awaitingApproval = post.ai_assisted && post.human_approved === false;

  return (
    <article className={`post-card${awaitingApproval ? ' post-card--pending' : ''}`}>
      <header className="post-header">
        <div className="avatar" aria-hidden="true">{(author?.display_name ?? 'M').slice(0, 1)}</div>
        <div>
          <strong>{author?.display_name ?? 'Member'}</strong>
          <div className="muted">@{author?.handle ?? post.author_id.slice(0, 8)}</div>
        </div>
        <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
      </header>

      <p className="post-copy">{post.body}</p>

      <div className="trust-row" aria-label="Trust context">
        {sourceLinks.length > 0 && <TrustChip tone="source">Source-linked · {sourceLinks.length}</TrustChip>}
        {post.ai_assisted && <TrustChip tone="ai">{assistanceLabel(post.ai_assistance_type)}</TrustChip>}
        {post.ai_assisted && post.human_approved === true && <TrustChip tone="human">Human approved</TrustChip>}
        {awaitingApproval && <TrustChip tone="dispute">Awaiting approval</TrustChip>}
      </div>

      <ContextDrawer label="View context">
        <dl className="context-detail-list">
          <div><dt>Created by</dt><dd>{author?.display_name ?? 'Member'} (@{author?.handle ?? post.author_id.slice(0, 8)})</dd></div>
          <div><dt>AI role</dt><dd>{post.ai_assisted ? assistanceLabel(post.ai_assistance_type) : 'None'}</dd></div>
          <div><dt>Human approval</dt><dd>{post.ai_assisted ? post.human_approved === true ? 'Confirmed' : 'Required before publication/use' : 'Not applicable'}</dd></div>
          <div><dt>Evidence</dt><dd>{sourceLinks.length} linked source{sourceLinks.length === 1 ? '' : 's'}</dd></div>
        </dl>
        {sourceLinks.map((link) => (
          <p className="context-note" key={link.source_id}>Source: <a href={link.sources.url} target="_blank" rel="noreferrer">{link.sources.title || link.sources.url}</a></p>
        ))}
        <p className="context-note">Provenance describes origin and transformation. It does not certify that a claim is true.</p>
      </ContextDrawer>

      <div className="reaction-bar" aria-label="Reactions">
        {['like', 'useful', 'interesting'].map((reaction) => (
          <form action={ownReactions.has(reaction) ? removeReaction : setReaction} key={reaction}>
            <input type="hidden" name="post_id" value={post.id} />
            <input type="hidden" name="reaction" value={reaction} />
            <button type="submit" className={`reaction-button${ownReactions.has(reaction) ? ' reaction-button--active' : ''}`}>
              {reaction} <span className="reaction-button__count">{reactionCounts[reaction] ?? 0}</span>
            </button>
          </form>
        ))}
      </div>

      {(post.comments ?? []).length > 0 && (
        <section className="comment-list" aria-label="Comments">
          {(post.comments ?? []).map((comment) => <p className="context-note" key={comment.id}><strong>{authorMap[comment.author_id]?.display_name ?? 'Member'}:</strong> {comment.body}</p>)}
        </section>
      )}

      {(post.claim_responses ?? []).length > 0 && (
        <section className="claim-response-list" aria-label="Contextual responses">
          {(post.claim_responses ?? []).map((response) => <p className="context-note" key={response.id}><strong>{response.response_type.replace('_', ' ')} · {authorMap[response.author_id]?.display_name ?? 'Member'}:</strong> {response.body}</p>)}
        </section>
      )}

      <div className="post-secondary-actions">
        <details><summary>Comment</summary><form action={createComment} className="login-form"><input type="hidden" name="post_id" value={post.id} /><textarea name="body" required /><button type="submit">Add comment</button></form></details>
        <details><summary>Respond with context</summary><form action={createClaimResponse} className="login-form"><input type="hidden" name="post_id" value={post.id} /><select name="response_type" defaultValue="challenge"><option value="support">Support</option><option value="challenge">Challenge</option><option value="qualify">Qualify</option><option value="add_evidence">Add evidence</option><option value="ask_question">Ask question</option></select><textarea name="body" required /><button type="submit">Add contextual response</button></form></details>
        <details><summary>Report</summary><form action={reportPost} className="login-form"><input type="hidden" name="post_id" value={post.id} /><select name="reason" defaultValue="misleading"><option value="spam">Spam</option><option value="harassment">Harassment</option><option value="misleading">Misleading</option><option value="other">Other</option></select><button type="submit">Submit report</button></form></details>
        <details><summary>Correction or appeal</summary><form action={requestCorrectionOrAppeal} className="login-form"><input type="hidden" name="post_id" value={post.id} /><select name="request_kind" defaultValue="correction"><option value="correction">Correction</option><option value="appeal">Appeal</option></select><textarea name="request_text" placeholder="Explain what should be reviewed. The original post will remain unchanged." required /><button type="submit">Record request</button></form></details>
      </div>

      {post.author_id !== userId && (
        <div className="row-actions">
          <form action={muteMember}><input type="hidden" name="target_user_id" value={post.author_id} /><button type="submit" className="secondary-button">Mute author</button></form>
          <form action={blockMember}><input type="hidden" name="target_user_id" value={post.author_id} /><button type="submit" className="secondary-button">Block author</button></form>
        </div>
      )}
    </article>
  );
}
