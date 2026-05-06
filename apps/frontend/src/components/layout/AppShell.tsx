'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import styles from './AppShell.module.css';

const SIDEBAR_STATE_KEY = 'kanbanchik_sidebar_collapsed';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(SIDEBAR_STATE_KEY);
    if (storedValue === 'true') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STATE_KEY, collapsed ? 'true' : 'false');
  }, [collapsed]);

  return (
    <div className={styles.shell}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <main className={styles.main}>
        {collapsed && (
          <button
            type="button"
            className={styles.revealButton}
            onClick={() => setCollapsed(false)}
            aria-label="Open menu"
          >
            <Image
              src="/boar.svg"
              alt="Kanbanchik"
              width={60}
              height={60}
              className={styles.revealLogo}
            />
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
