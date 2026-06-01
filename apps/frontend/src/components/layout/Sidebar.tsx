'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { PROJECTS_UPDATED_EVENT } from '@/lib/project-events';
import type { Project } from '@/lib/types';
import styles from './Sidebar.module.css';

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let active = true;
    const load = () => { api.getProjects().then((p) => { if (active) setProjects(p); }).catch(() => {}); };
    load();
    window.addEventListener(PROJECTS_UPDATED_EVENT, load);
    return () => { active = false; window.removeEventListener(PROJECTS_UPDATED_EVENT, load); };
  }, []);

  return (
    <aside className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}>
      <nav className={styles.sidebar}>
        <div className={styles.topRow}>
          <Link href="/projects" className={styles.logoLink} aria-label="Kanbanchik home">
            <Image src="/boar.svg" alt="Kanbanchik" width={60} height={60} className={styles.logo} />
          </Link>
          <button type="button" className={styles.toggleButton} onClick={onToggle}><X size={20} /></button>
        </div>
        <div className={styles.section}>Projects</div>
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}/board`}
            className={`${styles.navItem} ${pathname === `/projects/${p.id}/board` ? styles.active : ''}`}>
            {p.name}
          </Link>
        ))}
        <Link href="/projects" className={`${styles.navItem} ${pathname === '/projects' ? styles.active : ''}`}>
          All Projects
        </Link>
        <div className={styles.spacer} />
        <div className={styles.userSection}>
          <div className={styles.userLabel}>Loading…</div>
        </div>
      </nav>
    </aside>
  );
}
