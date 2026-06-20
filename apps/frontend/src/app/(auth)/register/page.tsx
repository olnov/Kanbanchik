'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../form.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await api.register(form);
      setCurrentUser(user);
      router.replace('/projects');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className={styles.eyebrow}>Get started</p>
      <h2 className={styles.title}>Create account</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">First name</label>
            <input className={styles.input} id="name" value={form.name} onChange={set('name')} required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lastName">Last name</label>
            <input className={styles.input} id="lastName" value={form.lastName} onChange={set('lastName')} required />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input className={styles.input} id="email" type="email" value={form.email}
            onChange={set('email')} placeholder="you@example.com" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input className={styles.input} id="password" type="password" value={form.password}
            onChange={set('password')} placeholder="At least 8 characters" required minLength={8} />
        </div>
        <button className={styles.primary} type="submit"
          disabled={loading || !form.name || !form.email || !form.password}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className={styles.switch}>
        Already have an account?{' '}
        <Link href="/login" className={styles.switchLink}>Sign in</Link>
      </p>
    </>
  );
}
