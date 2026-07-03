'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { JoinPreview } from '@/lib/types';
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

  if (mode === 'loading' || mode === 'accepting' || loading) {
    return <div className={styles.center}>Joining {preview?.projectName ?? ''}…</div>;
  }

  if (mode === 'error') {
    return <div className={styles.center}>{message}</div>;
  }

  if (mode === 'mismatch') {
    return (
      <div className={styles.center}>
        <p>{message}</p>
        <button className={styles.primary} onClick={() => void handleLogout()}>
          Log out &amp; switch account
        </button>
      </div>
    );
  }

  // mode === 'auth'
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Join {preview?.projectName}</h1>
      {message && <div className={styles.error}>{message}</div>}

      <div className={styles.tabs}>
        <button
          className={tab === 'register' ? styles.tabActive : styles.tab}
          onClick={() => setTab('register')}
        >
          Create account
        </button>
        <button
          className={tab === 'login' ? styles.tabActive : styles.tab}
          onClick={() => setTab('login')}
        >
          Sign in
        </button>
      </div>

      {tab === 'register' ? (
        <form onSubmit={(e) => void handleRegister(e)}>
          <input
            className={styles.input}
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={styles.input}
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            readOnly={inviteEmailLocked}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.primary} type="submit" disabled={busy}>
            {busy ? 'Joining…' : 'Create account & join'}
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => void handleLogin(e)}>
          <input
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            readOnly={inviteEmailLocked}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.primary} type="submit" disabled={busy}>
            {busy ? 'Joining…' : 'Sign in & join'}
          </button>
        </form>
      )}

      {mattermostEnabled && (
        <p className={styles.hint}>
          Mattermost users: sign in on the <a href="/login">login page</a> first, then reopen this
          link.
        </p>
      )}
    </div>
  );
}
