import Link from 'next/link';
import { LoginForm } from '../../components/login-form';
import { hasSupabaseEnv } from '../../lib/supabase/env';

function safeNext(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/app';
  return value;
}

export default async function LoginPage({ searchParams }) {
  const configured = hasSupabaseEnv();
  const params = await searchParams;
  const next = safeNext(params?.next);
  const callbackError = params?.error === 'auth_callback_failed';

  return (
    <main className="login-shell">
      <Link href="/" className="brand-mark">Intellectro</Link>
      <section className="login-card">
        <p className="eyebrow">Account boundary</p>
        <h1>Sign in without hiding the system state.</h1>
        <p>Authentication is enabled only when the Supabase public environment is configured. The alpha never fabricates a logged-in session.</p>
        {callbackError && <p className="context-note" role="alert">That sign-in link could not be verified. Request a new link and try again.</p>}
        <LoginForm configured={configured} next={next} />
      </section>
    </main>
  );
}
