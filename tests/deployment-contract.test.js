import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildDeploymentContract } from '../apps/web/lib/deployment-contract.js';

test('deployment contract exposes only non-secret governed runtime state', () => {
  const contract = buildDeploymentContract({
    NODE_ENV: 'production',
    VERCEL_GIT_COMMIT_SHA: 'abc123',
    VERCEL_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test'
  });

  assert.deepEqual(contract, {
    service: 'intellectro',
    status: 'ok',
    commitSha: 'abc123',
    environment: 'production',
    runtimeMode: 'configured',
    persistence: 'configured',
    configurationReason: 'persistence_configured',
    governance: {
      policyVersion: '0.1.0-alpha',
      defaultDecision: 'deny',
      autonomousPublicPosting: 'deny'
    }
  });
  assert.equal(JSON.stringify(contract).includes('sb_publishable_test'), false);
});

test('local deployment contract permits clearly identified demo mode', () => {
  const contract = buildDeploymentContract({ NODE_ENV: 'development' });
  assert.equal(contract.status, 'ok');
  assert.equal(contract.runtimeMode, 'demo');
  assert.equal(contract.persistence, 'disabled');
  assert.equal(contract.configurationReason, 'local_demo');
  assert.equal(contract.governance.autonomousPublicPosting, 'deny');
  assert.equal(contract.environment, 'local');
  assert.equal(contract.commitSha, null);
});

test('production deployment contract fails closed when persistence is not configured', () => {
  const contract = buildDeploymentContract({ NODE_ENV: 'production', VERCEL_ENV: 'production' });
  assert.equal(contract.status, 'misconfigured');
  assert.equal(contract.runtimeMode, 'misconfigured');
  assert.equal(contract.persistence, 'disabled');
  assert.equal(contract.configurationReason, 'production_persistence_missing');
  assert.equal(contract.governance.autonomousPublicPosting, 'deny');
});

test('partial persistence configuration is unhealthy and never demo mode', () => {
  const contract = buildDeploymentContract({
    NODE_ENV: 'development',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co'
  });
  assert.equal(contract.status, 'misconfigured');
  assert.equal(contract.runtimeMode, 'misconfigured');
  assert.equal(contract.configurationReason, 'partial_persistence_config');
});

test('web workspace declares the governance package consumed by its runtime', async () => {
  const webPackage = JSON.parse(await readFile(new URL('../apps/web/package.json', import.meta.url), 'utf8'));
  assert.equal(webPackage.dependencies?.['@intellectro/governance'], '0.0.1-alpha');
});
