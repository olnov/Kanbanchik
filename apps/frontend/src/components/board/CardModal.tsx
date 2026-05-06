'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Card, User } from '@/lib/types';
import styles from './CardModal.module.css';

interface CardModalProps {
  card: Card | null;
  stageId?: string;
  projectId?: string;
  users: User[];
  onClose: () => void;
  onSave: (card: Partial<Card>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CardModal({ card, stageId, projectId, users, onClose, onSave, onDelete }: CardModalProps) {
  const [summary, setSummary] = useState(card?.summary ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [type, setType] = useState(card?.type ?? 'task');
  const [priority, setPriority] = useState(card?.priority ?? 'medium');
  const [assigneeId, setAssigneeId] = useState(card?.assigneeId ?? '');
  const [dueDate, setDueDate] = useState(card?.dueDate ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...(card ?? {}),
      id: card?.id,
      summary,
      description: description || null,
      type,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      stageId: card?.stageId ?? stageId,
      projectId: card?.projectId ?? projectId,
    });
    setSaving(false);
  };

  return (
    <Modal title={card ? 'Edit Card' : 'New Card'} onClose={onClose}>
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Summary</label>
          <input
            className={styles.input}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details…"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="bug">Bug</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Priority</label>
            <select className={styles.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Assignee</label>
            <select className={styles.select} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Due Date</label>
            <input
              type="date"
              className={styles.input}
              value={dueDate ?? ''}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <div>
            {card && (
              <Button variant="danger" onClick={() => onDelete(card.id)}>
                Delete
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!summary.trim() || saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
