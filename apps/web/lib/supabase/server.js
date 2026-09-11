import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabasePublicConfig } from './env';

export async function createClient() {
  const config = getSupabasePublicConfig();
  if (!config.configured) throw new Error('Supabase public environment is not configured');
  const cookieStore = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot always write cookies. Refresh belongs in a request boundary. */ }
      }
    }
  });
}
