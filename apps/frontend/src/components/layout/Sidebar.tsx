'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PROJECTS_UPDATED_EVENT } from '@/lib/project-events';
import type { Project } from '@/lib/types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let active = true;
    const loadProjects = () => {
      api.getProjects().then((p) => { if (active) setProjects(p); }).catch(() => {});
    };
    loadProjects();
    window.addEventListener(PROJECTS_UPDATED_EVENT, loadProjects);
    return () => { active = false; window.removeEventListener(PROJECTS_UPDATED_EVENT, loadProjects); };
  }, []);

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    setCurrentUser(null);
    router.replace('/login');
  };

  return (
    <aside className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}>
      <nav className={styles.sidebar}>
        <div className={styles.topRow}>
          <Link href="/projects" className={styles.logoLink} aria-label="Kanbanchik home">
            <Image src="/boar.svg" alt="Kanbanchik" width={60} height={60} className={styles.logo} />
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

        <div className={styles.spacer} />

        <div className={styles.userSection}>
          {currentUser && (
            <>
              <div className={styles.userLabel}>
                {currentUser.name} {currentUser.lastName}
              </div>
              {currentUser.role && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  {currentUser.role}
                </div>
              )}
            </>
          )}
          <button
            type="button"
            className={styles.userSelect}
            style={{ cursor: 'pointer', textAlign: 'left' }}
            onClick={() => void handleLogout()}
          >
            Log out
          </button>
        </div>
      </nav>
    </aside>
  );
}
