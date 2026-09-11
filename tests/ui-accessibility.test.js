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

test('mobile keeps navigation when the desktop sidebar is hidden', () => {
  const css = read('apps/web/app/product-shell.css');
  assert.match(css, /\.mobile-nav/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.product-sidebar[\s\S]*display: none/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.mobile-nav[\s\S]*display:/);
  assert.match(css, /min-height: 44px/);
});

test('context remains reachable when the desktop right rail is hidden', () => {
  const shell = read('apps/web/components/app-shell.js');
  const css = read('apps/web/app/product-shell.css');
  assert.match(shell, /product-mobile-context/);
  assert.match(shell, /<ContextDrawer label="View page context">/);
  assert.match(css, /@media \(max-width: 1050px\)[\s\S]*\.product-mobile-context[\s\S]*display:/);
});

test('structural palette uses neutral surfaces and semantic accents', () => {
  const css = read('apps/web/app/product-shell.css');
  assert.match(css, /--surface:/);
  assert.match(css, /--ai:/);
  assert.match(css, /--source:/);
  assert.match(css, /--warn:/);
  assert.match(css, /--danger:/);
});

test('secondary product panels share deliberate hierarchy and destructive controls', () => {
  const css = read('apps/web/app/product-shell.css');
  for (const selector of ['.product-view', '.view-header', '.view-section', '.person-row', '.space-list__item', '.review-row', '.account-form', '.danger-button']) {
    assert.match(css, new RegExp(selector.replace('.', '\\.')));
  }
  assert.match(css, /\.danger-button[\s\S]*var\(--danger\)/);
});

test('root layout loads the product-shell visual layer after legacy globals', () => {
  const layout = read('apps/web/app/layout.js');
  assert.match(layout, /import '\.\/globals\.css';[\s\S]*import '\.\/product-shell\.css';/);
});
