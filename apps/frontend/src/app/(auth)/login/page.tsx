'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

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
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Sign in</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className={styles.footer}>
            <Button type="submit" disabled={loading || !email || !password}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <Link href="/register" className={styles.link}>
              Don&apos;t have an account? Register
            </Link>
          </div>
        </form>
        {mattermostEnabled && (
          <div className={styles.altAuth}>
            <div className={styles.divider}><span>or</span></div>
            {!showMattermost ? (
              <Button type="button" variant="ghost" onClick={() => setShowMattermost(true)}>
                Sign in with Mattermost
              </Button>
            ) : (
              <form onSubmit={(e) => void handleMattermostSubmit(e)}>
                <div className={styles.field}>
                  <label className={styles.label}>Mattermost username or email</label>
                  <input className={styles.input} type="text" value={mmLoginId}
                    onChange={(e) => setMmLoginId(e.target.value)} required autoFocus />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Mattermost password</label>
                  <input className={styles.input} type="password" value={mmPassword}
                    onChange={(e) => setMmPassword(e.target.value)} required />
                </div>
                <div className={styles.footer}>
                  <Button type="submit" disabled={loading || !mmLoginId || !mmPassword}>
                    {loading ? 'Signing in…' : 'Sign in with Mattermost'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
