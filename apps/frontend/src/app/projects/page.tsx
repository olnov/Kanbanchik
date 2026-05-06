import Link from 'next/link';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default async function ProjectsPage() {
  const projects = await api.getProjects();

  return (
    <div>
      <h1 className={styles.heading}>Projects</h1>
      <div className={styles.grid}>
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}/board`} className={styles.card}>
            <div className={styles.cardName}>{p.name}</div>
            <div className={styles.cardMeta}>View board →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
