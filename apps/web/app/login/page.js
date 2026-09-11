import Link from 'next/link';
import { LoginForm } from '../../components/login-form';
import { hasSupabaseEnv } from '../../lib/supabase/env';

export default function LoginPage() {
  const configured = hasSupabaseEnv();
  return (
    <main className="login-shell">
      <Link href="/" className="brand-mark">Intellectro</Link>
      <section className="login-card">
        <p className="eyebrow">Account boundary</p>
        <h1>Sign in without hiding the system state.</h1>
        <p>Authentication is enabled only when the Supabase public environment is configured. The alpha never fabricates a logged-in session.</p>
        <LoginForm configured={configured} />
      </section>
    </main>
  );
}
