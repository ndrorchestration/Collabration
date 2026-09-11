import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const modulePath = resolve('scripts/production-gate-preflight.mjs');

async function loadPreflight() {
  assert.equal(
    existsSync(modulePath),
    true,
    'production gate preflight must exist before Gate B can be attempted'
  );
  return import(pathToFileURL(modulePath));
}

test('production preflight admits only the exact configured production contract', async () => {
  const { evaluateProductionContract } = await loadPreflight();
  const result = evaluateProductionContract(
    {
      service: 'intellectro',
      status: 'ok',
      commitSha: 'abc123',
      environment: 'production',
      runtimeMode: 'configured',
      persistence: 'configured',
      governance: {
        policyVersion: '0.1.0-alpha',
        defaultDecision: 'deny',
        autonomousPublicPosting: 'deny'
      }
    },
    'abc123'
  );

  assert.deepEqual(result, { ok: true, reasons: [] });
});

test('production preflight rejects stale deployment identity', async () => {
  const { evaluateProductionContract } = await loadPreflight();
  const result = evaluateProductionContract(
    {
      service: 'intellectro',
      status: 'ok',
      commitSha: 'stale-sha',
      environment: 'production',
      runtimeMode: 'configured',
      persistence: 'configured',
      governance: {
        policyVersion: '0.1.0-alpha',
        defaultDecision: 'deny',
        autonomousPublicPosting: 'deny'
      }
    },
    'admitted-sha'
  );

  assert.equal(result.ok, false);
  assert.match(result.reasons.join('\n'), /commit SHA/i);
});

test('production preflight rejects disabled persistence or non-production runtime', async () => {
  const { evaluateProductionContract } = await loadPreflight();
  const result = evaluateProductionContract(
    {
      service: 'intellectro',
      status: 'ok',
      commitSha: 'abc123',
      environment: 'preview',
      runtimeMode: 'demo',
      persistence: 'disabled',
      governance: {
        policyVersion: '0.1.0-alpha',
        defaultDecision: 'deny',
        autonomousPublicPosting: 'deny'
      }
    },
    'abc123'
  );

  assert.equal(result.ok, false);
  assert.match(result.reasons.join('\n'), /production/i);
  assert.match(result.reasons.join('\n'), /persistence/i);
  assert.match(result.reasons.join('\n'), /runtime mode/i);
});

test('production preflight rejects authority drift even when deployment identity matches', async () => {
  const { evaluateProductionContract } = await loadPreflight();
  const result = evaluateProductionContract(
    {
      service: 'intellectro',
      status: 'ok',
      commitSha: 'abc123',
      environment: 'production',
      runtimeMode: 'configured',
      persistence: 'configured',
      governance: {
        policyVersion: '0.1.0-alpha',
        defaultDecision: 'allow',
        autonomousPublicPosting: 'allow'
      }
    },
    'abc123'
  );

  assert.equal(result.ok, false);
  assert.match(result.reasons.join('\n'), /default decision/i);
  assert.match(result.reasons.join('\n'), /autonomous public posting/i);
});

test('package exposes an explicit production-preflight command', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(
    pkg.scripts?.['verify:production-preflight'],
    'node scripts/production-gate-preflight.mjs'
  );
});
