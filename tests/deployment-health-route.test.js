import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const routePath = new URL('../apps/web/app/api/health/route.js', import.meta.url);

test('health route exposes deployment contract with no-store caching', () => {
  assert.equal(existsSync(routePath), true, 'expected /api/health route to exist');
  const source = readFileSync(routePath, 'utf8');
  assert.match(source, /buildDeploymentContract\(process\.env\)/);
  assert.match(source, /Cache-Control/);
  assert.match(source, /no-store/);
});
