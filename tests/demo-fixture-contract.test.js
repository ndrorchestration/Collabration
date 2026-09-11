import test from 'node:test';
import assert from 'node:assert/strict';
import { demoAuthors, demoFeed } from '../apps/web/lib/demo-data.js';

test('demo feed uses unique post ids and known authors', () => {
  const ids = demoFeed.map((post) => post.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const post of demoFeed) assert.ok(demoAuthors[post.authorId], `unknown author ${post.authorId}`);
});

test('pending AI output remains explicitly pending rather than approved', () => {
  const pending = demoFeed.find((post) => post.id === 'post-003');
  assert.equal(pending.kind, 'ai_assisted');
  assert.equal(pending.aiAssistance?.humanApproved, false);
});

test('demo includes revision-drift context without rewriting provenance as truth', () => {
  const drift = demoFeed.find((post) => post.id === 'post-004');
  assert.ok(drift);
  assert.equal(drift.kind, 'source_linked');
  assert.match(drift.text, /edited after the summary was generated/i);
  assert.match(drift.text, /original inputs/i);
});

test('demo authors expose stable ids for adapter/viewer matching', () => {
  for (const [id, author] of Object.entries(demoAuthors)) assert.equal(author.id, id);
});
