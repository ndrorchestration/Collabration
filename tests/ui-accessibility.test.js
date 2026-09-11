import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('context detail uses an accessible dialog and restores trigger focus', () => {
  const drawer = read('apps/web/components/context-drawer.js');
  assert.match(drawer, /<dialog/);
  assert.match(drawer, /aria-haspopup="dialog"/);
  assert.match(drawer, /showModal\(\)/);
  assert.match(drawer, /triggerRef\.current\?\.focus\(\)/);
  assert.match(drawer, /type="button"/);
});

test('post detail no longer expands a permanent inline details block', () => {
  const post = read('apps/web/components/post-card.js');
  assert.doesNotMatch(post, /<details className="context-panel">/);
  assert.match(post, /<ContextDrawer/);
  assert.match(post, /Provenance describes origin and transformation/);
});
