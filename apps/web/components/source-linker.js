'use client';

import { useState } from 'react';
import { demoStore } from '../lib/demo-store';

export function SourceLinker() {
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [notes, setNotes] = useState('');
  const [addedId, setAddedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const sources = demoStore.get().sources;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setSubmitting(true);
    const id = demoStore.addSource({
      url: url.trim(),
      title: title.trim() || url.trim(),
      publisher: publisher.trim(),
      notes: notes.trim(),
    });
    setAddedId(id);
    setUrl('');
    setTitle('');
    setPublisher('');
    setNotes('');
    setSubmitting(false);
    // Phase 2: log / update an in-shell source pill.
    console.log('source added:', id);
  };

  return (
    <div className="source-linker">
      <button
        className="source-linker__toggle"
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="source-linker__title">Sources</span>
        <span className="source-linker__count">{sources.length}</span>
      </button>

      {expanded && (
        <div className="source-linker__panel">
          {sources.length > 0 && (
            <ul className="source-linker__list">
              {sources.map((s) => (
                <li key={s.id} className="source-linker__row">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="source-linker__url">
                    {s.title}
                  </a>
                  {s.publisher && (
                    <span className="source-linker__publisher muted">{s.publisher}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form className="source-linker__form" onSubmit={handleAdd}>
            <input
              className="source-linker__input"
              type="url"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <input
              className="source-linker__input"
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="source-linker__input"
              type="text"
              placeholder="Publisher (optional)"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
            <textarea
              className="source-linker__input source-linker__notes"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
            <div className="source-linker__actions">
              <button
                type="submit"
                className="primary-button"
                disabled={!url.trim() || submitting}
              >
                {submitting ? 'Adding…' : addedId ? 'Added' : 'Add source'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
