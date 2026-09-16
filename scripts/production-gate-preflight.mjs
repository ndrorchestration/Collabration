import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Provider alias remains historical/operational until the Vercel project slug is actually renamed.
const DEFAULT_HEALTH_URL = 'https://intellectro.vercel.app/api/health';
const EXPECTED_POLICY_VERSION = '0.1.0-alpha';

export function evaluateProductionContract(contract, expectedSha) {
  const reasons = [];

  if (!expectedSha) reasons.push('expected commit SHA is required');
  if (contract?.service !== 'collabration') reasons.push('service must be collabration');
  if (contract?.status !== 'ok') reasons.push('deployment status must be ok');
  if (contract?.commitSha !== expectedSha) reasons.push('commit SHA does not match the admitted SHA');
  if (contract?.environment !== 'production') reasons.push('environment must be production');
  if (contract?.runtimeMode !== 'configured') reasons.push('runtime mode must be configured');
  if (contract?.persistence !== 'configured') reasons.push('persistence must be configured');
  if (contract?.governance?.policyVersion !== EXPECTED_POLICY_VERSION) {
    reasons.push(`governance policy version must be ${EXPECTED_POLICY_VERSION}`);
  }
  if (contract?.governance?.defaultDecision !== 'deny') {
    reasons.push('governance default decision must remain deny');
  }
  if (contract?.governance?.autonomousPublicPosting !== 'deny') {
    reasons.push('autonomous public posting must remain deny');
  }

  return Object.freeze({ ok: reasons.length === 0, reasons: Object.freeze(reasons) });
}

async function run() {
  const expectedSha = process.argv[2];
  const healthUrl = process.argv[3] || DEFAULT_HEALTH_URL;

  if (!expectedSha) {
    console.error('usage: npm run verify:production-preflight -- <expected-sha> [health-url]');
    process.exitCode = 2;
    return;
  }

  let response;
  try {
    response = await fetch(healthUrl, { cache: 'no-store' });
  } catch (error) {
    console.error(`production preflight failed: health request error: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  if (!response.ok) {
    console.error(`production preflight failed: health endpoint returned HTTP ${response.status}`);
    process.exitCode = 1;
    return;
  }

  let contract;
  try {
    contract = await response.json();
  } catch {
    console.error('production preflight failed: health endpoint did not return valid JSON');
    process.exitCode = 1;
    return;
  }

  const result = evaluateProductionContract(contract, expectedSha);
  if (!result.ok) {
    console.error('production preflight: NOT ADMITTED');
    for (const reason of result.reasons) console.error(`- ${reason}`);
    process.exitCode = 1;
    return;
  }

  console.log(`production preflight: ADMITTED sha=${contract.commitSha} persistence=${contract.persistence} policy=${contract.governance.policyVersion}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) await run();
