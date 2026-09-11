'use client';

const REACTIONS = ['like', 'useful', 'interesting'];

export function ReactionBar({ counts = {}, activeReactions = new Set(), onToggle }) {
  return (
    <div className="reaction-bar" aria-label="Reactions">
      {REACTIONS.map((reaction) => {
        const count = counts[reaction] ?? 0;
        const active = activeReactions.has(reaction);
        return (
          <button
            key={reaction}
            type="button"
            className={`reaction-button${active ? ' reaction-button--active' : ''}`}
            onClick={() => onToggle?.(reaction)}
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
