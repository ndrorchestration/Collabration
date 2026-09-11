import { resolveRuntimeMode } from './runtime-mode.js';

export function buildDeploymentContract(env = process.env) {
  const runtime = resolveRuntimeMode(env);

  return Object.freeze({
    service: 'intellectro',
    status: runtime.healthy ? 'ok' : 'misconfigured',
    commitSha: env.VERCEL_GIT_COMMIT_SHA || null,
    environment: env.VERCEL_ENV || 'local',
    runtimeMode: runtime.mode,
    persistence: runtime.persistenceConfigured ? 'configured' : 'disabled',
    configurationReason: runtime.reason,
    governance: Object.freeze({
      policyVersion: '0.1.0-alpha',
      defaultDecision: 'deny',
      autonomousPublicPosting: 'deny'
    })
  });
}
