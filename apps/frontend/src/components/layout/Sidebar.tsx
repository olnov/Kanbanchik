'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PROJECTS_UPDATED_EVENT } from '@/lib/project-events';
import { getStoredUserId, setStoredUserId } from '@/lib/user-context';
import { X } from 'lucide-react';
import type { User, Project } from '@/lib/types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSidebar = async () => {
      try {
        const nextUsers = await api.getUsers();
        const nextUserId = getStoredUserId();
        const nextProjects = await api.getProjects();

        if (!isMounted) {
          return;
        }

        setUsers(nextUsers);
        setProjects(nextProjects);
        setUserId(nextUserId);
        setLoadError(null);
      } catch (err) {
        if (isMounted) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load sidebar data');
        }
      }
    };

    const handleProjectsUpdated = () => {
      void loadSidebar();
    };

    void loadSidebar();
    window.addEventListener(PROJECTS_UPDATED_EVENT, handleProjectsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener(PROJECTS_UPDATED_EVENT, handleProjectsUpdated);
    };
  }, []);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStoredUserId(e.target.value);
    setUserId(e.target.value);
  };

  return (
    <aside className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}>
      <nav className={styles.sidebar}>
        <div className={styles.topRow}>
          <Link href="/projects" className={styles.logoLink} aria-label="Kanbanchik home">
            <Image
              src="/boar.svg"
              alt="Kanbanchik"
              width={60}
              height={60}
              className={styles.logo}
            />
          </Link>
          <button type="button" className={styles.toggleButton} onClick={onToggle}>
            <X size={20} />
          </button>
        </div>

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
        {projects.length === 0 && (
          <div className={styles.emptyHint}>No projects yet. Create one on the Projects page.</div>
        )}

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
          <select
            className={styles.userSelect}
            value={userId ?? ''}
            onChange={handleUserChange}
            disabled={users.length === 0}
          >
            <option value="" disabled>
              {users.length === 0 ? 'No users available' : 'Choose a user'}
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          {users.length === 0 && (
            <div className={styles.emptyHint}>No users found in the current workspace.</div>
          )}
          {loadError && <div className={styles.errorHint}>{loadError}</div>}
        </div>
      </nav>
    </aside>
  );
}
