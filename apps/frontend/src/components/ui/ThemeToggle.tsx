'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  // The no-flash script in the root layout sets data-theme before paint;
  // read it on mount so the button reflects the active theme.
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore storage errors (e.g. private mode) */
    }
    setTheme(next);
  };

  const goingDark = theme !== 'dark';

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={`Switch to ${goingDark ? 'dark' : 'light'} mode`}
      title="Toggle theme"
    >
      {goingDark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
