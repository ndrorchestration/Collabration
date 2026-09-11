import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getSupabasePublicConfig } from './env';

export async function updateSession(request) {
  const config = getSupabasePublicConfig();
  if (!config.configured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers = {}) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        response.headers.set('Cache-Control', 'private, no-store');
      }
    }
  });

  await supabase.auth.getClaims();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
