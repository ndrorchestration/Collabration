import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('ordinary human authorship is not repeated as a mandatory trust chip', () => {
  const post = read('apps/web/components/post-card.js');
  assert.doesNotMatch(post, /<TrustChip tone="human">Human-authored<\/TrustChip>/);
});

test('exceptional AI evidence and review states remain visible', () => {
  const signals = read('apps/web/components/trust-signals.js');
  assert.match(signals, /sourceCount/);
  assert.match(signals, /aiAssisted/);
  assert.match(signals, /Human approved/);
  assert.match(signals, /Awaiting approval/);
  assert.match(signals, /disputed/);
});

test('persisted post presentation uses exceptional states and keeps detailed context reachable', () => {
  const post = read('apps/web/components/persisted-post-card.js');
  assert.doesNotMatch(post, />Human-authored</);
  assert.match(post, /Source-linked/);
  assert.match(post, /AI/);
  assert.match(post, /Human approved/);
  assert.match(post, /Awaiting approval/);
  assert.match(post, /<ContextDrawer/);
  assert.match(post, /Provenance describes origin and transformation/);
});
