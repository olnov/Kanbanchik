'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { JoinPreview } from '@/lib/types';
import form from '../../form.module.css';
import styles from './join.module.css';

type Mode = 'loading' | 'accepting' | 'auth' | 'error' | 'mismatch';

export function JoinClient({ token }: { token: string }) {
  const router = useRouter();
  const { currentUser, loading, setCurrentUser } = useAuth();
  const [preview, setPreview] = useState<JoinPreview | null>(null);
  const [mode, setMode] = useState<Mode>('loading');
  const [message, setMessage] = useState<string | null>(null);

  // Auth form state (used when the visitor is not signed in).
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const mattermostEnabled = process.env.NEXT_PUBLIC_MATTERMOST_ENABLED === 'true';

  // Load the preview once.
  useEffect(() => {
    api
      .getJoinPreview(token)
      .then((p) => {
        setPreview(p);
        if (p.kind === 'invite' && p.invitedEmail) setEmail(p.invitedEmail);
      })
      .catch(() => {
        setMode('error');
        setMessage('This link is no longer valid.');
      });
  }, [token]);

  // Once the preview is loaded and auth is resolved, decide what to do.
  useEffect(() => {
    if (!preview || loading || mode === 'error') return;
    if (currentUser) {
      void acceptAndGo();
    } else {
      setMode('auth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, loading, currentUser]);

  const acceptAndGo = async () => {
    setMode('accepting');
    try {
      const { projectId } = await api.acceptJoin(token);
      router.replace(`/projects/${projectId}/board`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setMode('mismatch');
        setMessage(err.message);
      } else {
        setMode('error');
        setMessage('Could not join this project.');
      }
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const user = await api.register({ name, lastName, email, password });
      setCurrentUser(user);
      await acceptAndGo();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Registration failed');
      setBusy(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const user = await api.login(email, password);
      setCurrentUser(user);
      await acceptAndGo();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Login failed');
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setMode('auth');
    setMessage(null);
  };

  const inviteEmailLocked = preview?.kind === 'invite' && !!preview.invitedEmail;

  if (loading || mode === 'loading' || mode === 'accepting') {
    return <p className={styles.status}>Joining {preview?.projectName ?? ''}…</p>;
  }

  if (mode === 'error') {
    return (
      <>
        <h2 className={form.headline}>
          Broken <span className={form.highlight}>link</span>.
        </h2>
        <div className={form.error}>{message}</div>
      </>
    );
  }

  if (mode === 'mismatch') {
    return (
      <>
        <h2 className={form.headline}>
          Wrong <span className={form.highlight}>account</span>.
        </h2>
        <div className={form.error}>{message}</div>
        <button className={form.primary} onClick={() => void handleLogout()}>
          <span className={form.arrow} aria-hidden="true">
            →
          </span>
          Log out &amp; switch account
        </button>
      </>
    );
  }

  const registerForm = (
    <form onSubmit={(e) => void handleRegister(e)}>
      <div className={form.row}>
        <div className={form.field}>
          <label className={form.label} htmlFor="name">
            First name
          </label>
          <input
            className={form.input}
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className={form.field}>
          <label className={form.label} htmlFor="lastName">
            Last name
          </label>
          <input
            className={form.input}
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="email">
          Email
        </label>
        <input
          className={form.input}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          readOnly={inviteEmailLocked}
        />
        {inviteEmailLocked && <span className={form.hint}>Invited address</span>}
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="password">
          Password
        </label>
        <input
          className={form.input}
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          required
          minLength={8}
        />
        <span className={form.hint}>At least 8 characters</span>
      </div>
      <button
        className={form.primary}
        type="submit"
        disabled={busy || !name || !email || !password}
      >
        <span className={form.arrow} aria-hidden="true">
          →
        </span>
        {busy ? 'Joining…' : 'Create account & join'}
      </button>
    </form>
  );

  const loginForm = (
    <form onSubmit={(e) => void handleLogin(e)}>
      <div className={form.field}>
        <label className={form.label} htmlFor="login-email">
          Email
        </label>
        <input
          className={form.input}
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          readOnly={inviteEmailLocked}
        />
      </div>
      <div className={form.field}>
        <label className={form.label} htmlFor="login-password">
          Password
        </label>
        <input
          className={form.input}
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
        />
      </div>
      <button className={form.primary} type="submit" disabled={busy || !email || !password}>
        <span className={form.arrow} aria-hidden="true">
          →
        </span>
        {busy ? 'Joining…' : 'Sign in & join'}
      </button>
    </form>
  );

  // mode === 'auth'
  return (
    <>
      <span className={form.badge}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l1.8 6.4L20 10l-6.2 1.6L12 18l-1.8-6.4L4 10l6.2-1.6z" />
        </svg>
        You&apos;re invited
      </span>
      <h2 className={form.headline}>
        Join <span className={form.highlight}>{preview?.projectName}</span>.
      </h2>
      {message && <div className={form.error}>{message}</div>}

      {tab === 'register' ? registerForm : loginForm}

      <p className={form.switch}>
        {tab === 'register' ? (
          <>
            Already have an account?{' '}
            <button
              type="button"
              className={`${styles.linkButton} ${form.switchLink}`}
              onClick={() => setTab('login')}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            New here?{' '}
            <button
              type="button"
              className={`${styles.linkButton} ${form.switchLink}`}
              onClick={() => setTab('register')}
            >
              Create an account
            </button>
          </>
        )}
      </p>

      {mattermostEnabled && (
        <p className={styles.note}>
          Mattermost users: sign in on the{' '}
          <Link href="/login" className={form.switchLink}>
            login page
          </Link>{' '}
          first, then reopen this link.
        </p>
      )}
    </>
  );
}
