'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../form.module.css';

type Panel = 'email' | 'mattermost';

function Chevron() {
  return (
    <svg className={styles.chevron} width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mattermostEnabled = process.env.NEXT_PUBLIC_MATTERMOST_ENABLED === 'true';
  const [openPanel, setOpenPanel] = useState<Panel>('email');
  const [mmLoginId, setMmLoginId] = useState('');
  const [mmPassword, setMmPassword] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const mmRef = useRef<HTMLInputElement>(null);
  const didMount = useRef(false);

  // Move focus to the first field of the panel the user just opened.
  useEffect(() => {
    if (!mattermostEnabled) return;
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    (openPanel === 'email' ? emailRef : mmRef).current?.focus();
  }, [openPanel, mattermostEnabled]);

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

  const emailForm = (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input ref={emailRef} className={styles.input} id="email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
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
  );

  return (
    <>
      <p className={styles.eyebrow}>Welcome back</p>
      <h2 className={styles.title}>Sign in</h2>
      {error && <div className={styles.error}>{error}</div>}

      {!mattermostEnabled ? (
        emailForm
      ) : (
        <div className={styles.accordion}>
          <section className={`${styles.panel} ${openPanel === 'email' ? styles.open : ''}`}>
            <button type="button" className={`${styles.panelHeader} ${styles.panelHeaderFocus}`}
              aria-expanded={openPanel === 'email'} aria-controls="panel-email"
              onClick={() => setOpenPanel('email')}>
              <span className={styles.panelHeaderLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                Email &amp; password
              </span>
              <Chevron />
            </button>
            <div className={styles.panelBody} id="panel-email" inert={openPanel !== 'email'}>
              <div className={styles.panelBodyInner}>
                <div className={styles.panelContent}>{emailForm}</div>
              </div>
            </div>
          </section>

          <section className={`${styles.panel} ${openPanel === 'mattermost' ? styles.open : ''}`}>
            <button type="button" className={`${styles.panelHeader} ${styles.panelHeaderFocus}`}
              aria-expanded={openPanel === 'mattermost'} aria-controls="panel-mattermost"
              onClick={() => setOpenPanel('mattermost')}>
              <span className={styles.panelHeaderLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
                </svg>
                Sign in with Mattermost
              </span>
              <Chevron />
            </button>
            <div className={styles.panelBody} id="panel-mattermost" inert={openPanel !== 'mattermost'}>
              <div className={styles.panelBodyInner}>
                <div className={styles.panelContent}>
                  <form onSubmit={(e) => void handleMattermostSubmit(e)}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="mm-login">Mattermost username or email</label>
                      <input ref={mmRef} className={styles.input} id="mm-login" type="text" value={mmLoginId}
                        onChange={(e) => setMmLoginId(e.target.value)} required />
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
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      <p className={styles.switch}>
        New to Kanbanchik?{' '}
        <Link href="/register" className={styles.switchLink}>Create an account</Link>
      </p>
    </>
  );
}
