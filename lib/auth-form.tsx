'use client';
import { useState, type FormEvent, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './auth.module.css';

export function AuthForm({ signup = false }: { signup?: boolean }): ReactElement {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    const credentials = { email: form.get('email'), password: form.get('password'), ...(signup ? { fullName: form.get('fullName') } : {}) };
    try {
      const response = await fetch(`/api/auth/${signup ? 'signup' : 'signin'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
      const result: unknown = await response.json();
      if (typeof result === 'object' && result !== null) {
        if ('redirectTo' in result && result.redirectTo === '/dashboard' && response.ok) { router.push('/dashboard'); router.refresh(); return; }
        if ('message' in result && typeof result.message === 'string') { setMessage(result.message); return; }
        if ('error' in result && typeof result.error === 'object' && result.error !== null && 'message' in result.error && typeof result.error.message === 'string') { setMessage(result.error.message); return; }
      }
      setMessage('Unable to complete this request. Please try again.');
    } catch { setMessage('Unable to reach the service. Please try again.'); }
    finally { setBusy(false); }
  }
  return <main className={styles.shell}><section className={styles.card}>
    <Link href="/" className={styles.brand}>NUWAVE <span>Specialty Coffee</span></Link>
    <p className={styles.eyebrow}>Staff access</p>
    <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
    <p>{signup ? 'Create an account, then wait for an administrator to approve your access.' : 'Sign in to manage the Nuwave menu.'}</p>
    <form onSubmit={submit}>
      {signup && <label>Full name<input name="fullName" autoComplete="name" required maxLength={200} /></label>}
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} /></label>
      <button disabled={busy} type="submit">{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
      <p role="status" aria-live="polite" className={styles.message}>{message}</p>
    </form>
    <Link href={signup ? '/login' : '/signup'}>{signup ? 'Already registered? Sign in' : 'Need staff access? Create an account'}</Link>
  </section></main>;
}

export function SignOutButton(): ReactElement {
  const router = useRouter(); const [message, setMessage] = useState('');
  async function signOut(): Promise<void> {
    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (!response.ok) { setMessage('Could not sign out. Please try again.'); return; }
      router.push('/login'); router.refresh();
    } catch { setMessage('Could not reach the service.'); }
  }
  return <><button onClick={signOut}>Sign out</button><p role="status">{message}</p></>;
}
