'use client';

import { useState } from 'react';
import { ProfileHover } from './profile-hover';
import { demoAuthors } from '../lib/demo-data';

export function CommentThread({ comments: initialComments, author }) {
  const [comments, setComments] = useState(initialComments || []);
  const [text, setText] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    const comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorId: author?.id ?? 'demo-user',
      displayName: author?.displayName ?? 'Demo user',
      handle: author?.handle ?? '@demo',
      body: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments([comment, ...comments]);
    setText('');
  }

  return (
    <section className="comment-thread" aria-label="Comments">
      <div className="comment-thread__header">
        <p className="comment-thread__title">Comments</p>
        <p className="comment-thread__count">{comments.length}</p>
      </div>
      <div className="comment-list" role="list">
        {comments.map((comment) => (
          <div className="comment" key={comment.id} role="listitem">
            <div className="comment__avatar" aria-hidden="true">
              {comment.displayName.slice(0, 1)}
            </div>
            <div className="comment__body">
              <div className="comment__meta">
                <ProfileHover author={{ displayName: comment.displayName, handle: comment.handle, role: '' }} bio={demoAuthors[comment.authorId]?.bio} />
                <span className="comment__time">
                  {new Date(comment.createdAt).toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="comment__text">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>
      <form className="comment-composer" onSubmit={submit}>
        <textarea
          className="comment-composer__input"
          placeholder="Add a comment…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={1}
          aria-label="Comment text"
        />
        <button
          type="submit"
          className="comment-composer__button"
          disabled={!text.trim()}
        >
          Comment
        </button>
      </form>
      <p className="context-note">Demo comments are not persisted.</p>
    </section>
  );
}
