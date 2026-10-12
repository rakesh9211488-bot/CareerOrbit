'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, Loader2, Mail } from 'lucide-react';
import { PasswordInput } from './PasswordInput';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="account-form" aria-busy={loading}>
      {error && <div className="form-alert" role="alert"><AlertCircle size={17} aria-hidden="true" /><span>{error}</span></div>}
      <div className="form-field">
        <label htmlFor="login-email">Email address</label>
        <div className="input-wrap"><Mail className="input-icon" size={17} aria-hidden="true" /><input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="form-input" /></div>
      </div>
      <div className="form-field">
        <label htmlFor="login-password">Password</label>
        <PasswordInput id="login-password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
      </div>
      <button type="submit" disabled={loading} className="account-submit">{loading ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Signing in…</> : <>Sign in to your workspace <ArrowRight size={18} aria-hidden="true" /></>}</button>
    </form>
  );
}
