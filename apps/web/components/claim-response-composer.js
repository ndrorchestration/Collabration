'use client';

import { useState } from 'react';
import { demoStore } from '../lib/demo-store';
import { RESPONSE_TYPES, RESPONSE_LABEL_MAP } from '../lib/response-types';

export function ClaimResponseComposer({ post, author }) {
  const [type, setType] = useState('challenge');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    demoStore.addClaimResponse({
      id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      postId: post.id,
      authorId: author.id,
      type,
      text: text.trim(),
      sourceIds: [],
    });

    setText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 600);
  };

  const typeOptions = RESPONSE_TYPES.map((t) => ({
    value: t,
    label: RESPONSE_LABEL_MAP[t] ?? t,
  }));

  return (
    <form className="claim-response-composer" onSubmit={handleSubmit}>
      <label className="response-type-select">
        <span className="muted">Type</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Response type"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <textarea
        className="response-textarea"
        placeholder="Add your response…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={10000}
        aria-label="Response body"
      />
      <div className="composer-actions">
        <button
          type="submit"
          className="primary-button"
          disabled={!text.trim()}
        >
          {submitted ? 'Posted' : 'Respond'}
        </button>
      </div>
    </form>
  );
}
