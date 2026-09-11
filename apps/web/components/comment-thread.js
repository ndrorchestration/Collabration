'use client';

import { useState } from 'react';
import { ProfileHover } from './profile-hover';

export function CommentThread({ comments = [], viewer, authorBios = {}, onSubmit, mode = 'demo' }) {
  const [text, setText] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    await onSubmit?.(text.trim());
    setText('');
  }

  return (
    <section className="comment-thread" aria-label="Comments">
      <div className="comment-thread__header">
        <p className="comment-thread__title">Comments</p>
        <p className="comment-thread__count">{comments.length}</p>
      </div>
      <div className="comment-list" role="list">
        {comments.map((comment) => {
          const displayName = comment.displayName ?? comment.display_name ?? 'Member';
          const handle = comment.handle ?? '';
          const createdAt = comment.createdAt ?? comment.created_at;
          const authorId = comment.authorId ?? comment.author_id;
          return (
            <div className="comment" key={comment.id} role="listitem">
              <div className="comment__avatar" aria-hidden="true">{displayName.slice(0, 1)}</div>
              <div className="comment__body">
                <div className="comment__meta">
                  <ProfileHover author={{ displayName, handle }} bio={authorBios[authorId]} />
                  {createdAt && <span className="comment__time">{new Date(createdAt).toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>}
                </div>
                <p className="comment__text">{comment.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      {viewer && onSubmit && (
        <form className="comment-composer" onSubmit={submit}>
          <textarea className="comment-composer__input" placeholder="Add a comment…" value={text} onChange={(event) => setText(event.target.value)} rows={1} aria-label="Comment text" />
          <button type="submit" className="comment-composer__button" disabled={!text.trim()}>Comment</button>
        </form>
      )}
      {mode === 'demo' && <p className="context-note">Demo comments are browser-local and are not authenticated or server-persisted.</p>}
    </section>
  );
}
