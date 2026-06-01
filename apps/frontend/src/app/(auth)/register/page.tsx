'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

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
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Create account</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className={styles.field}>
            <label className={styles.label}>First name</label>
            <input className={styles.input} value={form.name} onChange={set('name')} required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Last name</label>
            <input className={styles.input} value={form.lastName} onChange={set('lastName')} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={form.password} onChange={set('password')} required minLength={8} />
          </div>
          <div className={styles.footer}>
            <Button type="submit" disabled={loading || !form.name || !form.email || !form.password}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
            <Link href="/login" className={styles.link}>
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
