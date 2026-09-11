import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) await supabase.auth.signOut();
  } catch {
    // Sign-out remains idempotent when runtime configuration is missing or stale.
  }

  revalidatePath('/', 'layout');
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}
