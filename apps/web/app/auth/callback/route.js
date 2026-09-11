import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

function safeNext(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/app';
  return value;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = safeNext(searchParams.get('next'));

  try {
    const supabase = await createClient();
    let error = null;

    if (code) {
      ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } else if (tokenHash && type) {
      ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
    } else {
      error = new Error('Missing authentication callback token');
    }

    if (!error) return NextResponse.redirect(new URL(next, request.url));
  } catch {
    // Fall through to a generic login error without reflecting secret callback values.
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
}
