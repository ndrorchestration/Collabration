import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRuntimeMode } from '../apps/web/lib/runtime-mode.js';

test('local development without Supabase config may enter explicit demo mode', () => {
  assert.deepEqual(resolveRuntimeMode({ NODE_ENV: 'development' }), {
    mode: 'demo',
    persistenceConfigured: false,
    healthy: true,
    reason: 'local_demo'
  });
});

test('production without Supabase config fails closed', () => {
  const result = resolveRuntimeMode({ NODE_ENV: 'production', VERCEL_ENV: 'production' });
  assert.equal(result.mode, 'misconfigured');
  assert.equal(result.persistenceConfigured, false);
  assert.equal(result.healthy, false);
  assert.equal(result.reason, 'production_persistence_missing');
});

test('partial Supabase config is misconfigured in every mode', () => {
  const result = resolveRuntimeMode({
    NODE_ENV: 'development',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co'
  });
  assert.equal(result.mode, 'misconfigured');
  assert.equal(result.persistenceConfigured, false);
  assert.equal(result.healthy, false);
  assert.equal(result.reason, 'partial_persistence_config');
});

test('complete Supabase config selects configured mode', () => {
  const result = resolveRuntimeMode({
    NODE_ENV: 'production',
    VERCEL_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public-key'
  });
  assert.equal(result.mode, 'configured');
  assert.equal(result.persistenceConfigured, true);
  assert.equal(result.healthy, true);
  assert.equal(result.reason, 'persistence_configured');
});
