'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { dispatchProjectsUpdated } from '@/lib/project-events';
import type { Project } from '@/lib/types';
import styles from './page.module.css';

export default function ProjectsPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .getProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(data);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load projects');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = projectName.trim();
    if (!name) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const project = await api.createProject({ name });
      setProjects((current) => [...current, project]);
      setProjectName('');
      dispatchProjectsUpdated();
      router.push(`/projects/${project.id}/board`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    const confirmed = window.confirm(
      `Delete project "${project.name}"?\n\nThis will soft delete the project together with all its columns and cards.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingProjectId(project.id);
    setError(null);

    try {
      await api.deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      dispatchProjectsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeletingProjectId(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Projects</h1>
          <p className={styles.subheading}>
            Create a project to get a board with default columns and start adding cards.
          </p>
        </div>
        <form className={styles.createForm} onSubmit={handleCreateProject}>
          <input
            className={styles.input}
            type="text"
            placeholder="New project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Button type="submit" disabled={isCreating || !projectName.trim()}>
            {isCreating ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>No projects yet</div>
          <div className={styles.emptyText}>
            Create your first project here. Each new project gets To Do, In Progress, Review, and
            Done columns automatically.
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((p) => (
            <div key={p.id} className={styles.card}>
              <Link href={`/projects/${p.id}/board`} className={styles.cardLink}>
                <div className={styles.cardName}>{p.name}</div>
                <div className={styles.cardMeta}>Open board and add cards</div>
              </Link>
              {p.createdById === currentUser?.id && (
                <div className={styles.cardActions}>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void handleDeleteProject(p)}
                    disabled={deletingProjectId === p.id}
                  >
                    {deletingProjectId === p.id ? 'Deleting...' : 'Delete Project'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
