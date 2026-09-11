export function buildDeploymentContract(env = process.env) {
  const persistenceConfigured = Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  return Object.freeze({
    service: 'intellectro',
    status: 'ok',
    commitSha: env.VERCEL_GIT_COMMIT_SHA || null,
    environment: env.VERCEL_ENV || 'local',
    persistence: persistenceConfigured ? 'configured' : 'disabled',
    governance: Object.freeze({
      policyVersion: '0.1.0-alpha',
      defaultDecision: 'deny',
      autonomousPublicPosting: 'deny'
    })
  });
}
