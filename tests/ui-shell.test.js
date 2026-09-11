import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('shell exposes only implemented destinations and role-gates Review', () => {
  const nav = read('apps/web/components/primary-nav.js');
  assert.match(nav, /Home/);
  assert.match(nav, /Spaces/);
  assert.match(nav, /People/);
  assert.match(nav, /canReview[\s\S]*Review/);
  assert.match(nav, /Account/);
  assert.doesNotMatch(nav, />Projects</);
  assert.doesNotMatch(nav, />Agent</);
});

test('mobile navigation preserves implemented destinations', () => {
  const nav = read('apps/web/components/mobile-nav.js');
  assert.match(nav, /aria-current/);
  assert.match(nav, /Home/);
  assert.match(nav, /Spaces/);
  assert.match(nav, /People/);
  assert.match(nav, /You/);
});

test('shell does not pretend a non-interactive search control exists', () => {
  const shell = read('apps/web/components/app-shell.js');
  assert.doesNotMatch(shell, /topbar-search/);
  assert.doesNotMatch(shell, /Search people, Spaces, sources, and projects/);
});

test('authenticated page derives a bounded presentation view and uses compact SpaceHeader', () => {
  const page = read('apps/web/app/app/page.js');
  assert.match(page, /const requestedView/);
  assert.match(page, /home.*spaces.*people.*review.*account/s);
  assert.match(page, /<SpaceHeader/);
  assert.doesNotMatch(page, /<section className="space-hero">/);
});
