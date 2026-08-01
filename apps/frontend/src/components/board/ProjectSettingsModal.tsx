'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type {
  ProjectInvite,
  ProjectMember,
  ProjectPermissionLevel,
  ShareLink,
  User,
} from '@/lib/types';
import styles from './ProjectSettingsModal.module.css';

const ROLES: ProjectPermissionLevel[] = ['viewer', 'collaborator', 'admin'];

const AVATAR_COLORS = [
  'var(--color-indigo)',
  'var(--color-amber)',
  'var(--color-green)',
  'var(--color-purple)',
];

function renderCodePreview(pattern: string, projectName: string, number: number): string {
  const compactName = projectName.replace(/\s+/gu, '').toUpperCase();
  return pattern
    .replace(/\{PROJECT(?::(\d+))?\}/gu, (_token, length?: string) =>
      length ? Array.from(compactName).slice(0, Number(length)).join('') : compactName,
    )
    .replace(/\{NUMBER\}/gu, String(number));
}

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
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectPermissionLevel>('viewer');
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [myPermission, setMyPermission] = useState<ProjectPermissionLevel | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [projectName, setProjectName] = useState('');
  const [createdById, setCreatedById] = useState<string | null>(null);
  const [cardCodeEnabled, setCardCodeEnabled] = useState(true);
  const [cardCodePattern, setCardCodePattern] = useState('{PROJECT:4}-{NUMBER}');
  const [savedCardCodeEnabled, setSavedCardCodeEnabled] = useState(true);
  const [savedCardCodePattern, setSavedCardCodePattern] = useState('{PROJECT:4}-{NUMBER}');
  const [nextCardNumber, setNextCardNumber] = useState(1);
  const [savingCardCode, setSavingCardCode] = useState(false);
  const [cardCodeSaved, setCardCodeSaved] = useState(false);
  const [backfillingCardCodes, setBackfillingCardCodes] = useState(false);
  const [cardCodeBackfillResult, setCardCodeBackfillResult] = useState<string | null>(null);
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
    setCardCodeEnabled(boardData.project.cardCodeEnabled);
    setCardCodePattern(boardData.project.cardCodePattern);
    setSavedCardCodeEnabled(boardData.project.cardCodeEnabled);
    setSavedCardCodePattern(boardData.project.cardCodePattern);
    setNextCardNumber(boardData.project.nextCardNumber);
    setMembers(membersData.members);
    setInvites(membersData.invites);
    setMyPermission(membersData.myPermission);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (myPermission === 'admin') {
      api
        .getUsers()
        .then(setAllUsers)
        .catch(() => {});
    }
  }, [myPermission]);

  useEffect(() => {
    if (myPermission === 'admin') {
      api
        .getShareLink(projectId)
        .then(setShareLink)
        .catch(() => {});
    }
  }, [myPermission, projectId]);

  const isAdmin = myPermission === 'admin';
  const cardCodeSettingsDirty =
    cardCodeEnabled !== savedCardCodeEnabled || cardCodePattern !== savedCardCodePattern;
  const cardCodePatternValid =
    cardCodePattern.trim().length > 0 && cardCodePattern.includes('{NUMBER}');
  const owner = useMemo(
    () => allUsers.find((u) => u.id === createdById) ?? null,
    [allUsers, createdById],
  );

  const addableUsers = useMemo(() => {
    const taken = new Set([...(createdById ? [createdById] : []), ...members.map((m) => m.userId)]);
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

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setError(null);
    try {
      await api.createInvite(projectId, inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('viewer');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    }
  };

  const handleRevoke = async (invite: ProjectInvite) => {
    if (!window.confirm(`Revoke the invite for ${invite.email}?`)) return;
    setError(null);
    try {
      await api.revokeInvite(projectId, invite.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite');
    }
  };

  const joinUrl = (token: string) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${token}`;

  const saveLink = async (
    data: { role: ProjectPermissionLevel; enabled: boolean },
    regenerate = false,
  ) => {
    setError(null);
    try {
      const link = await api.saveShareLink(projectId, data, regenerate);
      setShareLink(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update share link');
    }
  };

  const copyLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(joinUrl(shareLink.token));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const copyInviteLink = async (invite: ProjectInvite) => {
    await navigator.clipboard.writeText(joinUrl(invite.token));
    setCopiedInviteId(invite.id);
    window.setTimeout(() => setCopiedInviteId(null), 1500);
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

  const handleSaveCardCode = async () => {
    setError(null);
    setCardCodeSaved(false);
    setSavingCardCode(true);
    try {
      const project = await api.updateCardCodeSettings(projectId, {
        enabled: cardCodeEnabled,
        pattern: cardCodePattern,
      });
      setCardCodeEnabled(project.cardCodeEnabled);
      setCardCodePattern(project.cardCodePattern);
      setSavedCardCodeEnabled(project.cardCodeEnabled);
      setSavedCardCodePattern(project.cardCodePattern);
      setNextCardNumber(project.nextCardNumber);
      setCardCodeSaved(true);
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update card codes');
    } finally {
      setSavingCardCode(false);
    }
  };

  const handleBackfillCardCodes = async () => {
    if (!window.confirm('Generate codes for all existing cards without one?')) return;
    setError(null);
    setCardCodeBackfillResult(null);
    setBackfillingCardCodes(true);
    try {
      const result = await api.backfillCardCodes(projectId);
      setNextCardNumber(result.nextCardNumber);
      setCardCodeBackfillResult(
        result.updatedCount > 0
          ? `Generated codes for ${result.updatedCount} cards`
          : 'All existing cards already have codes',
      );
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate card codes');
    } finally {
      setBackfillingCardCodes(false);
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
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Button disabled={!selectedUserId} onClick={() => void handleAdd()}>
                Add
              </Button>
            </div>
          )}

          {isAdmin && (
            <div className={styles.addRow}>
              <input
                className={styles.addSelect}
                type="email"
                placeholder="Invite by email…"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <select
                className={styles.roleSelect}
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as ProjectPermissionLevel)}
                aria-label="Role for invited email"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Button disabled={!inviteEmail} onClick={() => void handleInvite()}>
                Invite
              </Button>
            </div>
          )}

          {isAdmin && (
            <section className={styles.cardCodeSection}>
              <div className={styles.sectionTitle}>Card codes</div>
              <label className={styles.shareToggle}>
                <input
                  type="checkbox"
                  checked={cardCodeEnabled}
                  onChange={(event) => {
                    setCardCodeEnabled(event.target.checked);
                    setCardCodeSaved(false);
                    setCardCodeBackfillResult(null);
                  }}
                />
                Add a generated code to new card titles
              </label>
              <label className={styles.fieldLabel} htmlFor="card-code-pattern">
                Code pattern
              </label>
              <div className={styles.addRowCompact}>
                <input
                  id="card-code-pattern"
                  className={styles.addSelect}
                  value={cardCodePattern}
                  maxLength={80}
                  disabled={!cardCodeEnabled}
                  onChange={(event) => {
                    setCardCodePattern(event.target.value);
                    setCardCodeSaved(false);
                    setCardCodeBackfillResult(null);
                  }}
                  aria-describedby="card-code-help"
                />
                <Button
                  disabled={
                    savingCardCode ||
                    !cardCodePattern.includes('{NUMBER}') ||
                    !cardCodePattern.trim()
                  }
                  onClick={() => void handleSaveCardCode()}
                >
                  {savingCardCode ? 'Saving…' : cardCodeSaved ? 'Saved' : 'Save'}
                </Button>
              </div>
              <div id="card-code-help" className={styles.fieldHelp}>
                Use {'{PROJECT}'}, {'{PROJECT:N}'} and {'{NUMBER}'}. The code is wrapped in
                brackets.
              </div>
              {cardCodeEnabled && cardCodePattern.includes('{NUMBER}') && (
                <div className={styles.codePreview}>
                  Preview: [{renderCodePreview(cardCodePattern, projectName, nextCardNumber)}]
                </div>
              )}
              <div className={styles.cardCodeBackfill}>
                <Button
                  variant="ghost"
                  disabled={
                    backfillingCardCodes ||
                    savingCardCode ||
                    !cardCodeEnabled ||
                    !cardCodePatternValid ||
                    cardCodeSettingsDirty
                  }
                  onClick={() => void handleBackfillCardCodes()}
                >
                  {backfillingCardCodes ? 'Generating…' : 'Generate codes for existing cards'}
                </Button>
                {cardCodeBackfillResult && (
                  <div className={styles.cardCodeResult} role="status">
                    {cardCodeBackfillResult}
                  </div>
                )}
              </div>
            </section>
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
                <Avatar
                  name={member.user.name}
                  lastName={member.user.lastName}
                  seed={member.userId}
                />
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
                      onChange={(e) =>
                        void handleRoleChange(
                          member.userId,
                          e.target.value as ProjectPermissionLevel,
                        )
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
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

          {invites.length > 0 && (
            <>
              <div className={styles.sectionTitle}>
                Pending invites <span className={styles.count}>{invites.length}</span>
              </div>
              <div className={styles.list}>
                {invites.map((invite) => (
                  <div key={invite.id} className={styles.row}>
                    <Avatar name={invite.email} seed={invite.id} />
                    <div className={styles.who}>
                      <div className={styles.name}>{invite.email}</div>
                      <div className={styles.meta}>account not created yet · {invite.role}</div>
                    </div>
                    {isAdmin && (
                      <>
                        <button
                          className={styles.inviteLink}
                          onClick={() => void copyInviteLink(invite)}
                        >
                          {copiedInviteId === invite.id ? 'Copied!' : 'Copy link'}
                        </button>
                        <button className={styles.remove} onClick={() => void handleRevoke(invite)}>
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {isAdmin && (
            <div className={styles.shareSection}>
              <div className={styles.sectionTitle}>Share link</div>
              <label className={styles.shareToggle}>
                <input
                  type="checkbox"
                  checked={!!shareLink?.enabled}
                  onChange={(e) =>
                    void saveLink({ role: shareLink?.role ?? 'viewer', enabled: e.target.checked })
                  }
                />
                Anyone with the link can join
              </label>

              {shareLink?.enabled && (
                <>
                  <div className={styles.addRow}>
                    <input className={styles.addSelect} readOnly value={joinUrl(shareLink.token)} />
                    <Button onClick={() => void copyLink()}>{copied ? 'Copied!' : 'Copy'}</Button>
                  </div>
                  <div className={styles.addRow}>
                    <select
                      className={styles.roleSelect}
                      value={shareLink.role}
                      onChange={(e) =>
                        void saveLink({
                          role: e.target.value as ProjectPermissionLevel,
                          enabled: true,
                        })
                      }
                      aria-label="Role granted by share link"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      className={styles.remove}
                      onClick={() => void saveLink({ role: shareLink.role, enabled: true }, true)}
                    >
                      Regenerate
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
        </div>
      )}
    </Modal>
  );
}
