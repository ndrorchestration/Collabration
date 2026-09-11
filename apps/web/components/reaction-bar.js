'use client';

import { demoStore } from '../lib/demo-store';

const REACTIONS = ['like', 'useful', 'interesting'];

export function ReactionBar({ post, currentUserId }) {
  const reactions = demoStore.getReactionsForPost(post.id);

  return (
    <div className="reaction-bar" aria-label="Reactions">
      {REACTIONS.map((reaction) => {
        const count = reactions[reaction] ?? 0;
        const active = count > 0;
        return (
          <button
            key={reaction}
            type="button"
            className={`reaction-button${active ? ' reaction-button--active' : ''}`}
            onClick={() => demoStore.toggleReaction(post.id, currentUserId, reaction)}
            aria-pressed={active}
          >
            <span className="reaction-button__label">{reaction}</span>
            <span className="reaction-button__count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
