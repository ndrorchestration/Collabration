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
