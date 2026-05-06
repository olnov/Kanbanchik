'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getStoredUserId, setStoredUserId } from '@/lib/user-context';
import type { User, Project } from '@/lib/types';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getStoredUserId());
    api.getUsers().then((data) => {
      setUsers(data);
      if (!getStoredUserId() && data.length > 0) {
        setStoredUserId(data[0].id);
        setUserId(data[0].id);
      }
    });
    api.getProjects().then(setProjects);
  }, []);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStoredUserId(e.target.value);
    setUserId(e.target.value);
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>Kanbanchik</div>

      <div className={styles.section}>Projects</div>
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}/board`}
          className={`${styles.navItem} ${pathname === `/projects/${p.id}/board` ? styles.active : ''}`}
        >
          {p.name}
        </Link>
      ))}
      <Link
        href="/projects"
        className={`${styles.navItem} ${pathname === '/projects' ? styles.active : ''}`}
      >
        All Projects
      </Link>

      <div className={styles.section}>Workspace</div>
      <Link
        href="/teams"
        className={`${styles.navItem} ${pathname === '/teams' ? styles.active : ''}`}
      >
        Teams
      </Link>

      <div className={styles.spacer} />

      <div className={styles.userSection}>
        <div className={styles.userLabel}>Active User</div>
        <select className={styles.userSelect} value={userId ?? ''} onChange={handleUserChange}>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
