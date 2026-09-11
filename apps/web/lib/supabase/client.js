import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicConfig } from './env';

let browserClient;
export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config.configured) throw new Error('Supabase public environment is not configured');
  browserClient ??= createBrowserClient(config.url, config.publishableKey);
  return browserClient;
}
