import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const reusableComponents = [
  '../apps/web/components/reaction-bar.js',
  '../apps/web/components/comment-thread.js',
  '../apps/web/components/claim-response-composer.js',
  '../apps/web/components/source-linker.js',
  '../apps/web/components/moderator-queue.js',
  '../apps/web/components/action-log-viewer.js',
  '../apps/web/components/profile-hover.js',
  '../apps/web/components/trust-signals.js'
];

test('reusable social components do not own demoStore directly', async () => {
  for (const path of reusableComponents) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.equal(source.includes('demo-store'), false, `${path} must receive state/actions through an adapter`);
    assert.equal(source.includes('demoStore'), false, `${path} must not synthesize demo authority`);
  }
});

test('configured persisted app does not import demo state or hard-code a demo actor', async () => {
  const source = await readFile(new URL('../apps/web/app/app/page.js', import.meta.url), 'utf8');
  assert.equal(source.includes('demo-store'), false);
  assert.equal(source.includes('demoStore'), false);
  assert.equal(source.includes('currentUserId="user-ender"'), false);
  assert.equal(source.includes("const userId = claims.sub"), true);
});

test('demoStore ownership is isolated to the demo adapter', async () => {
  const source = await readFile(new URL('../apps/web/lib/ui-adapters/demo.js', import.meta.url), 'utf8');
  assert.equal(source.includes("import { demoStore } from '../demo-store.js'"), true);
  assert.equal(source.includes("mode: 'demo'"), true);
});
