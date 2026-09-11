'use client';

import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

export function LoginForm({ configured }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (!configured) return;
    setBusy(true); setMessage('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
      setMessage(error ? error.message : 'Check your email for the sign-in link.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start sign-in.');
    } finally { setBusy(false); }
  }
  return (
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={!configured || busy} />
      <button type="submit" disabled={!configured || busy}>{busy ? 'Sending…' : 'Send sign-in link'}</button>
      {!configured && <p className="context-note">Demo mode: configure the public Supabase URL and publishable key to enable authentication.</p>}
      {message && <p className="context-note" role="status">{message}</p>}
    </form>
  );
}
