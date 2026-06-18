'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectMember, ProjectPermissionLevel, User } from '@/lib/types';
import styles from './ProjectSettingsModal.module.css';

const ROLES: ProjectPermissionLevel[] = ['viewer', 'collaborator', 'admin'];

const AVATAR_COLORS = [
  'var(--color-indigo)',
  'var(--color-amber)',
  'var(--color-green)',
  'var(--color-purple)',
];

function initials(name: string, lastName?: string): string {
  const first = name.trim().charAt(0);
  const second = (lastName ?? name.trim().split(/\s+/)[1] ?? '').charAt(0);
  return (first + second).toUpperCase() || '?';
}

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name, lastName, seed }: { name: string; lastName?: string; seed: string }) {
  return (
    <span className={styles.avatar} style={{ background: avatarColor(seed) }} aria-hidden>
      {initials(name, lastName)}
    </span>
  );
}

interface ProjectSettingsModalProps {
  projectId: string;
  onClose: () => void;
  onChange?: () => void;
}

export function ProjectSettingsModal({ projectId, onClose, onChange }: ProjectSettingsModalProps) {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [myPermission, setMyPermission] = useState<ProjectPermissionLevel | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [projectName, setProjectName] = useState('');
  const [createdById, setCreatedById] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newRole, setNewRole] = useState<ProjectPermissionLevel>('viewer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [boardData, membersData] = await Promise.all([
      api.getBoard(projectId),
      api.getProjectMembers(projectId),
    ]);
    setProjectName(boardData.project.name);
    setCreatedById(boardData.project.createdById);
    setMembers(membersData.members);
    setMyPermission(membersData.myPermission);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (myPermission === 'admin') {
      api.getUsers().then(setAllUsers).catch(() => {});
    }
  }, [myPermission]);

  const isAdmin = myPermission === 'admin';
  const owner = useMemo(
    () => allUsers.find((u) => u.id === createdById) ?? null,
    [allUsers, createdById],
  );

  const addableUsers = useMemo(() => {
    const taken = new Set([
      ...(createdById ? [createdById] : []),
      ...members.map((m) => m.userId),
    ]);
    return allUsers.filter((u) => !taken.has(u.id));
  }, [allUsers, members, createdById]);

  const refresh = async () => {
    await load();
    onChange?.();
  };

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setError(null);
    try {
      await api.addProjectMember(projectId, selectedUserId, newRole);
      setSelectedUserId('');
      setNewRole('viewer');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleRoleChange = async (userId: string, role: ProjectPermissionLevel) => {
    setError(null);
    try {
      await api.updateProjectMemberRole(projectId, userId, role);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleRemove = async (member: ProjectMember) => {
    if (!window.confirm(`Remove ${member.user.name} from this project?`)) return;
    setError(null);
    try {
      await api.removeProjectMember(projectId, member.userId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const memberCount = members.length + (createdById ? 1 : 0);

  return (
    <Modal title={loading ? 'Project settings' : `${projectName} — settings`} onClose={onClose}>
      {loading ? (
        <div className={styles.status}>Loading…</div>
      ) : (
        <div className={styles.body}>
          {isAdmin && (
            <div className={styles.addRow}>
              <select
                className={styles.addSelect}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Add a member by name…</option>
                {addableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
              <select
                className={styles.roleSelect}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as ProjectPermissionLevel)}
                aria-label="Role for new member"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <Button disabled={!selectedUserId} onClick={() => void handleAdd()}>
                Add
              </Button>
            </div>
          )}

          <div className={styles.sectionTitle}>
            Members <span className={styles.count}>{memberCount}</span>
          </div>

          <div className={styles.list}>
            {owner && (
              <div className={styles.row}>
                <Avatar name={owner.name} lastName={owner.lastName} seed={owner.id} />
                <div className={styles.who}>
                  <div className={styles.name}>
                    {owner.name} {owner.lastName}
                    {owner.id === currentUser?.id ? ' (you)' : ''}
                  </div>
                  <div className={styles.meta}>{owner.email} · owner</div>
                </div>
                <span className={styles.ownerBadge}>Admin</span>
              </div>
            )}
            {!owner && createdById && (
              <div className={styles.row}>
                <Avatar name="Owner" seed={createdById} />
                <div className={styles.who}>
                  <div className={styles.name}>Project owner</div>
                  <div className={styles.meta}>owner</div>
                </div>
                <span className={styles.ownerBadge}>Admin</span>
              </div>
            )}

            {members.map((member) => (
              <div key={member.id} className={styles.row}>
                <Avatar name={member.user.name} lastName={member.user.lastName} seed={member.userId} />
                <div className={styles.who}>
                  <div className={styles.name}>
                    {member.user.name} {member.user.lastName}
                    {member.userId === currentUser?.id ? ' (you)' : ''}
                  </div>
                  <div className={styles.meta}>{member.user.email}</div>
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
                    <button className={styles.remove} onClick={() => void handleRemove(member)}>
                      Remove
                    </button>
                  </>
                ) : (
                  <span className={styles.role}>{member.role}</span>
                )}
              </div>
            ))}
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>
      )}
    </Modal>
  );
}
