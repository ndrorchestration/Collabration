export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
  return Object.freeze({ url, publishableKey, configured: Boolean(url && publishableKey) });
}

export function hasSupabaseEnv() {
  return getSupabasePublicConfig().configured;
}
