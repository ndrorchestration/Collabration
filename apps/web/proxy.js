import { updateSession } from './lib/supabase/proxy';

export async function proxy(request) {
  return updateSession(request);
}

export const config = {
  matcher: ['/app/:path*', '/auth/:path*', '/login']
};
