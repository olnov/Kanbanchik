'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../form.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mattermostEnabled = process.env.NEXT_PUBLIC_MATTERMOST_ENABLED === 'true';
  const [showMattermost, setShowMattermost] = useState(false);
  const [mmLoginId, setMmLoginId] = useState('');
  const [mmPassword, setMmPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await api.login(email, password);
      setCurrentUser(user);
      router.replace('/projects');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMattermostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await api.loginMattermost(mmLoginId, mmPassword);
      setCurrentUser(user);
      router.replace('/projects');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Mattermost login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className={styles.eyebrow}>Welcome back</p>
      <h2 className={styles.title}>Sign in</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input className={styles.input} id="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input className={styles.input} id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
        </div>
        <button className={styles.primary} type="submit" disabled={loading || !email || !password}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {mattermostEnabled && (
        <div className={styles.altAuth}>
          <div className={styles.divider}>or</div>
          {!showMattermost ? (
            <button className={styles.ghost} type="button" onClick={() => setShowMattermost(true)}>
              Sign in with Mattermost
            </button>
          ) : (
            <form onSubmit={(e) => void handleMattermostSubmit(e)}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="mm-login">Mattermost username or email</label>
                <input className={styles.input} id="mm-login" type="text" value={mmLoginId}
                  onChange={(e) => setMmLoginId(e.target.value)} required autoFocus />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="mm-password">Mattermost password</label>
                <input className={styles.input} id="mm-password" type="password" value={mmPassword}
                  onChange={(e) => setMmPassword(e.target.value)} required />
              </div>
              <button className={styles.primary} type="submit" disabled={loading || !mmLoginId || !mmPassword}>
                {loading ? 'Signing in…' : 'Sign in with Mattermost'}
              </button>
            </form>
          )}
        </div>
      )}

      <p className={styles.switch}>
        New to Kanbanchik?{' '}
        <Link href="/register" className={styles.switchLink}>Create an account</Link>
      </p>
    </>
  );
}
