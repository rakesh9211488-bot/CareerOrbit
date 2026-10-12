'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Briefcase, CheckCircle2, ChevronDown, Loader2, Mail, MapPin, User } from 'lucide-react';
import { PasswordInput } from './PasswordInput';
import type { JobPreference } from '@/types';

const JOB_PREFERENCES: JobPreference[] = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Designer', 'Marketing', 'DevOps', 'Sales', 'Other'];

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', job_preference: '' as JobPreference | '', location: '', password: '', confirm_password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const strength = form.password.length < 8 ? 1 : form.password.length < 12 || !/[^a-zA-Z0-9]/.test(form.password) ? 2 : 3;
  const passwordMatch = Boolean(form.confirm_password && form.password === form.confirm_password);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: '' }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.full_name.trim()) errors.full_name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
    if (!form.job_preference) errors.job_preference = 'Choose the kind of role you’re looking for.';
    if (!form.location.trim()) errors.location = 'Enter your preferred location.';
    if (form.password.length < 8) errors.password = 'Use at least 8 characters.';
    if (!form.confirm_password || form.password !== form.confirm_password) errors.confirm_password = 'Passwords need to match.';
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length) { document.getElementById(`register-${Object.keys(errors)[0]}`)?.focus(); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const profileDetails = { full_name: form.full_name.trim(), email: form.email.trim(), job_preference: form.job_preference, location: form.location.trim() };
      const { data, error: authError } = await supabase.auth.signUp({
        email: profileDetails.email, password: form.password,
        options: { data: profileDetails },
      });
      if (authError) throw authError;
      if (!data.user) throw new Error('We couldn’t create your account. Please try again.');
      if (!data.session) { setConfirmation(true); return; }
      // Confirmation-required accounts save their profile on the first authenticated dashboard visit.
      const { error: profileError } = await supabase.from('profiles').upsert({ id: data.user.id, ...profileDetails }, { onConflict: 'id' });
      if (profileError) {
        setError('Your account was created, but your profile could not be saved. Sign in to view your workspace; the profile database needs configuration.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  }

  if (confirmation) return <div className="confirmation-state" role="status"><span><CheckCircle2 size={30} aria-hidden="true" /></span><h3>Check your inbox.</h3><p>If this email needs confirmation, you’ll receive a link at <strong>{form.email}</strong>. Follow it, then return here to sign in.</p><button type="button" className="text-button" onClick={() => { setConfirmation(false); update('password', ''); update('confirm_password', ''); }}>Back to create account <ArrowRight size={15} aria-hidden="true" /></button></div>;

  return (
    <form onSubmit={handleSubmit} className="account-form" noValidate aria-busy={loading}>
      {error && <div className="form-alert" role="alert"><AlertCircle size={17} aria-hidden="true" /><span>{error}</span></div>}
      <div className="form-field"><label htmlFor="register-full_name">Full name</label><div className="input-wrap"><User size={17} className="input-icon" aria-hidden="true" /><input id="register-full_name" autoComplete="name" required className="form-input" placeholder="Your full name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} aria-invalid={Boolean(fieldErrors.full_name)} aria-describedby={fieldErrors.full_name ? 'name-error' : undefined} /></div>{fieldErrors.full_name && <p id="name-error" className="field-error">{fieldErrors.full_name}</p>}</div>
      <div className="form-field"><label htmlFor="register-email">Email address</label><div className="input-wrap"><Mail size={17} className="input-icon" aria-hidden="true" /><input id="register-email" type="email" autoComplete="email" required className="form-input" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} /></div>{fieldErrors.email && <p id="email-error" className="field-error">{fieldErrors.email}</p>}</div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="register-job_preference">Your next role</label><div className="input-wrap"><Briefcase size={17} className="input-icon" aria-hidden="true" /><select id="register-job_preference" className="form-input" required value={form.job_preference} onChange={(e) => update('job_preference', e.target.value)} aria-invalid={Boolean(fieldErrors.job_preference)} aria-describedby={fieldErrors.job_preference ? 'role-error' : undefined}><option value="" disabled>Select a role</option>{JOB_PREFERENCES.map((pref) => <option key={pref}>{pref}</option>)}</select><ChevronDown size={15} className="select-chevron" aria-hidden="true" /></div>{fieldErrors.job_preference && <p id="role-error" className="field-error">{fieldErrors.job_preference}</p>}</div>
        <div className="form-field"><label htmlFor="register-location">Preferred location</label><div className="input-wrap"><MapPin size={17} className="input-icon" aria-hidden="true" /><input id="register-location" className="form-input" required autoComplete="address-level2" placeholder="Berlin, Germany" value={form.location} onChange={(e) => update('location', e.target.value)} aria-invalid={Boolean(fieldErrors.location)} aria-describedby={fieldErrors.location ? 'location-error' : undefined} /></div>{fieldErrors.location && <p id="location-error" className="field-error">{fieldErrors.location}</p>}</div>
      </div>
      <div className="form-field"><label htmlFor="register-password">Password <span>At least 8 characters</span></label><PasswordInput id="register-password" required autoComplete="new-password" minLength={8} placeholder="Create a password" value={form.password} onChange={(e) => update('password', e.target.value)} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'password-error' : form.password ? 'password-strength' : undefined} />{form.password && <div className="password-strength" id="password-strength"><div data-strength={strength}><i /><i /><i /></div><span>{['', 'Too short', 'Good', 'Strong'][strength]}</span></div>}{fieldErrors.password && <p id="password-error" className="field-error">{fieldErrors.password}</p>}</div>
      <div className="form-field"><label htmlFor="register-confirm_password">Confirm password {passwordMatch && <span className="password-matched"><CheckCircle2 size={12} aria-hidden="true" /> Matched</span>}</label><PasswordInput id="register-confirm_password" required autoComplete="new-password" placeholder="One more time" value={form.confirm_password} onChange={(e) => update('confirm_password', e.target.value)} aria-invalid={Boolean(fieldErrors.confirm_password)} aria-describedby={fieldErrors.confirm_password ? 'confirm-error' : undefined} />{fieldErrors.confirm_password && <p id="confirm-error" className="field-error">{fieldErrors.confirm_password}</p>}</div>
      <button type="submit" disabled={loading} className="account-submit">{loading ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Creating your account…</> : <>Find my next chapter <ArrowRight size={18} aria-hidden="true" /></>}</button>
      <p className="form-footnote">Create your account to get started. You decide where to apply.</p>
    </form>
  );
}
