import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('review panel renders existing governed review state without querying data', () => {
  const review = read('apps/web/components/review-panel.js');
  assert.match(review, /pendingActions/);
  assert.match(review, /openCorrections/);
  assert.match(review, /agentActions/);
  assert.match(review, /permissionInspections/);
  assert.doesNotMatch(review, /createClient|supabase|from\('/);
});

test('spaces panel only binds existing create and join actions', () => {
  const spaces = read('apps/web/components/spaces-panel.js');
  assert.match(spaces, /createSpace/);
  assert.match(spaces, /joinSpace/);
  assert.doesNotMatch(spaces, /agent|approval|capability/i);
});
