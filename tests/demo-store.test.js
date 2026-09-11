import test from 'node:test';
import assert from 'node:assert/strict';
import { demoStore } from '../apps/web/lib/demo-store.js';

function makeLocalStorage() {
  const storage = new Map();
  return {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    }
  };
}

test.beforeEach(() => {
  global.window = { localStorage: makeLocalStorage() };
});

test.afterEach(() => {
  delete global.window;
});

test('reaction counts are isolated by post id', () => {
  demoStore.toggleReaction('post-a', 'user-a', 'like');
  demoStore.toggleReaction('post-b', 'user-b', 'useful');

  assert.deepEqual(demoStore.getReactionsForPost('post-a'), {
    like: 1,
    useful: 0,
    interesting: 0
  });

  assert.deepEqual(demoStore.getReactionsForPost('post-b'), {
    like: 0,
    useful: 1,
    interesting: 0
  });
});

test('active reaction state belongs to the current user rather than aggregate count', () => {
  demoStore.toggleReaction('post-a', 'user-a', 'like');

  assert.equal(demoStore.hasReaction('post-a', 'user-a', 'like'), true);
  assert.equal(demoStore.hasReaction('post-a', 'user-b', 'like'), false);
});

test('demo state is browser-local and survives reads from localStorage', () => {
  demoStore.toggleReaction('post-a', 'user-a', 'interesting');
  assert.equal(demoStore.get().reactions['post-a:user-a:interesting'], true);
});
