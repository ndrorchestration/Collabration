'use client';

import { useState } from 'react';

export function SourceLinker({ sources = [], onAdd, disabled = false, mode = 'demo' }) {
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd(event) {
    event.preventDefault();
    if (!url.trim() || !onAdd || disabled) return;
    setSubmitting(true);
    await onAdd({
      url: url.trim(),
      title: title.trim() || url.trim(),
      publisher: publisher.trim(),
      notes: notes.trim()
    });
    setUrl('');
    setTitle('');
    setPublisher('');
    setNotes('');
    setAdded(true);
    setSubmitting(false);
  }

  return (
    <div className="source-linker">
      <button className="source-linker__toggle" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <span className="source-linker__title">Sources</span>
        <span className="source-linker__count">{sources.length}</span>
      </button>
      {expanded && (
        <div className="source-linker__panel">
          {sources.length > 0 && (
            <ul className="source-linker__list">
              {sources.map((source) => (
                <li key={source.id} className="source-linker__row">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-linker__url">{source.title || source.url}</a>
                  {source.publisher && <span className="source-linker__publisher muted">{source.publisher}</span>}
                </li>
              ))}
            </ul>
          )}
          {onAdd && (
            <form className="source-linker__form" onSubmit={handleAdd}>
              <input className="source-linker__input" type="url" placeholder="URL" value={url} onChange={(event) => setUrl(event.target.value)} required disabled={disabled} />
              <input className="source-linker__input" type="text" placeholder="Title (optional)" value={title} onChange={(event) => setTitle(event.target.value)} disabled={disabled} />
              <input className="source-linker__input" type="text" placeholder="Publisher (optional)" value={publisher} onChange={(event) => setPublisher(event.target.value)} disabled={disabled} />
              <textarea className="source-linker__input source-linker__notes" placeholder="Notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} disabled={disabled} />
              <div className="source-linker__actions"><button type="submit" className="primary-button" disabled={disabled || !url.trim() || submitting}>{submitting ? 'Adding…' : added ? 'Added' : 'Add source'}</button></div>
            </form>
          )}
          {mode === 'demo' && <p className="context-note">Demo sources are browser-local examples and are not authoritative provenance records.</p>}
        </div>
      )}
    </div>
  );
}
