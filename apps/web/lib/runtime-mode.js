export function resolveRuntimeMode(env = process.env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
  const hasUrl = Boolean(url);
  const hasKey = Boolean(publishableKey);
  const persistenceConfigured = hasUrl && hasKey;

  if (hasUrl !== hasKey) {
    return Object.freeze({
      mode: 'misconfigured',
      persistenceConfigured: false,
      healthy: false,
      reason: 'partial_persistence_config'
    });
  }

  if (persistenceConfigured) {
    return Object.freeze({
      mode: 'configured',
      persistenceConfigured: true,
      healthy: true,
      reason: 'persistence_configured'
    });
  }

  const production = env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production';
  if (production) {
    return Object.freeze({
      mode: 'misconfigured',
      persistenceConfigured: false,
      healthy: false,
      reason: 'production_persistence_missing'
    });
  }

  return Object.freeze({
    mode: 'demo',
    persistenceConfigured: false,
    healthy: true,
    reason: 'local_demo'
  });
}
