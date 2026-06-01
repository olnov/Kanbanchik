'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectMember, ProjectPermissionLevel, User } from '@/lib/types';
import styles from './page.module.css';

const ROLES: ProjectPermissionLevel[] = ['viewer', 'collaborator', 'admin'];

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [myPermission, setMyPermission] = useState<ProjectPermissionLevel | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [projectName, setProjectName] = useState('');
  const [createdById, setCreatedById] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [boardData, membersData] = await Promise.all([
      api.getBoard(id),
      api.getProjectMembers(id),
    ]);
    setProjectName(boardData.project.name);
    setCreatedById(boardData.project.createdById);
    setMembers(membersData.members);
    setMyPermission(membersData.myPermission);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (myPermission === 'admin') {
      api.getUsers().then(setAllUsers).catch(() => {});
    }
  }, [myPermission]);

  const isAdmin = myPermission === 'admin';
  const memberUserIds = new Set([
    ...(createdById ? [createdById] : []),
    ...members.map((m) => m.userId),
  ]);
  const addableUsers = allUsers.filter((u) => !memberUserIds.has(u.id));

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setError(null);
    try {
      await api.addProjectMember(id, selectedUserId);
      setSelectedUserId('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleRoleChange = async (userId: string, role: ProjectPermissionLevel) => {
    setError(null);
    try {
      await api.updateProjectMemberRole(id, userId, role);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleRemove = async (member: ProjectMember) => {
    if (!window.confirm(`Remove ${member.user.name} from this project?`)) return;
    setError(null);
    try {
      await api.removeProjectMember(id, member.userId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  if (loading) return <div className={styles.status}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Settings — {projectName}</h1>
        <Link href={`/projects/${id}/board`} className={styles.backLink}>← Back to board</Link>
      </div>

      <div className={styles.sectionTitle}>Members</div>

      {createdById && (
        <div className={styles.memberRow}>
          <div style={{ flex: 1 }}>
            <div className={styles.memberName}>
              {allUsers.find((u) => u.id === createdById)?.name ?? 'Project Owner'}
              {createdById === currentUser?.id ? ' (you)' : ''}
            </div>
          </div>
          <span className={styles.ownerBadge}>Admin — owner</span>
        </div>
      )}

      {members.map((member) => (
        <div key={member.id} className={styles.memberRow}>
          <div style={{ flex: 1 }}>
            <div className={styles.memberName}>
              {member.user.name} {member.user.lastName}
              {member.userId === currentUser?.id ? ' (you)' : ''}
            </div>
            <div className={styles.memberEmail}>{member.user.email}</div>
          </div>
          {isAdmin ? (
            <>
              <select
                className={styles.roleSelect}
                value={member.role}
                onChange={(e) => void handleRoleChange(member.userId, e.target.value as ProjectPermissionLevel)}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <Button variant="danger" onClick={() => void handleRemove(member)}>Remove</Button>
            </>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{member.role}</span>
          )}
        </div>
      ))}

      {isAdmin && (
        <div className={styles.addRow}>
          <select
            className={styles.addSelect}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Add member…</option>
            {addableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.lastName} ({u.email})
              </option>
            ))}
          </select>
          <Button disabled={!selectedUserId} onClick={() => void handleAdd()}>
            Add
          </Button>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
