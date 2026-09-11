'use client';

import { useState } from 'react';
import { RESPONSE_TYPES, RESPONSE_LABEL_MAP } from '../lib/response-types';

export function ClaimResponseComposer({ onSubmit, disabled = false }) {
  const [type, setType] = useState('challenge');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim() || disabled) return;
    await onSubmit?.(type, text.trim());
    setText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 600);
  }

  return (
    <form className="claim-response-composer" onSubmit={handleSubmit}>
      <label className="response-type-select">
        <span className="muted">Type</span>
        <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Response type" disabled={disabled}>
          {RESPONSE_TYPES.map((value) => <option key={value} value={value}>{RESPONSE_LABEL_MAP[value] ?? value}</option>)}
        </select>
      </label>
      <textarea
        className="response-textarea"
        placeholder="Add your response…"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        maxLength={10000}
        aria-label="Response body"
        disabled={disabled}
      />
      <div className="composer-actions">
        <button type="submit" className="primary-button" disabled={disabled || !text.trim()}>
          {submitted ? 'Posted' : 'Respond'}
        </button>
      </div>
    </form>
  );
}
