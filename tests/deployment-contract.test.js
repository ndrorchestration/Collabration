import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDeploymentContract } from '../apps/web/lib/deployment-contract.js';

test('deployment contract exposes only non-secret governed runtime state', () => {
  const contract = buildDeploymentContract({
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
    persistence: 'configured',
    governance: {
      policyVersion: '0.1.0-alpha',
      defaultDecision: 'deny',
      autonomousPublicPosting: 'deny'
    }
  });
  assert.equal(JSON.stringify(contract).includes('sb_publishable_test'), false);
});

test('deployment contract fails closed when persistence is not configured', () => {
  const contract = buildDeploymentContract({});
  assert.equal(contract.persistence, 'disabled');
  assert.equal(contract.governance.autonomousPublicPosting, 'deny');
  assert.equal(contract.environment, 'local');
  assert.equal(contract.commitSha, null);
});
