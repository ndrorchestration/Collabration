import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('demo foregrounds product content instead of permanent governance instructions', () => {
  const page = read('apps/web/app/page.js');
  const rail = read('apps/web/components/demo-governance-rail.js');
  assert.doesNotMatch(page, /Alpha boundaries/);
  assert.doesNotMatch(rail, /How to read Intellectro/);
  assert.doesNotMatch(page, /Search people, Spaces, sources, and projects/);
  assert.match(page, /illustrative/i);
  assert.match(page, /authenticated session|authenticated/i);
  assert.match(page, /persisted provenance|persisted/i);
});

test('demo keeps a compact trust explanation and optional review detail', () => {
  const rail = read('apps/web/components/demo-governance-rail.js');
  assert.match(rail, /Why Intellectro is different|Trust context/);
  assert.match(rail, /Illustrative review/);
  assert.match(rail, /<details/);
  assert.doesNotMatch(rail, /<CommunityStatePanel/);
});
