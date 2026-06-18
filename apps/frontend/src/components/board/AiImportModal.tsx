'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api, ApiError } from '@/lib/api';
import type { CardDraft, Stage } from '@/lib/types';
import styles from './AiImportModal.module.css';

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const idx = err.message.indexOf(' — ');
    if (idx >= 0) return err.message.slice(idx + 3);
  }
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
}

interface AiImportModalProps {
  projectId: string;
  stages: Stage[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function AiImportModal({ projectId, stages, onClose, onConfirm }: AiImportModalProps) {
  const [text, setText] = useState('');
  const [drafts, setDrafts] = useState<CardDraft[] | null>(null);
  const [targetStageId, setTargetStageId] = useState(stages[0]?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.importSpec(text);
      setDrafts(result);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (index: number) => {
    setDrafts((prev) => prev?.filter((_, i) => i !== index) ?? null);
  };

  const handleConfirm = async () => {
    if (!drafts) return;
    setLoading(true);
    setError(null);
    try {
      await api.confirmImport(projectId, targetStageId, drafts);
      await onConfirm();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Import from Spec" onClose={onClose}>
      {!drafts ? (
        <>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            Paste your project specification or requirements below. The AI will generate cards from it.
          </p>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste spec text here…"
          />
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.footer}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={text.length < 10 || loading}>
              {loading ? 'Generating…' : 'Generate Cards'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Review the generated cards. Remove any you don&apos;t need, then confirm to add them to the board.
          </p>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
              Add to stage
            </label>
            <select className={styles.stageSelect} value={targetStageId} onChange={(e) => setTargetStageId(e.target.value)}>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className={styles.drafts}>
            {drafts.map((draft, i) => (
              <div key={i} className={styles.draft}>
                <div className={styles.draftContent}>
                  <div className={styles.draftSummary}>{draft.summary}</div>
                  <div className={styles.draftDesc}>{draft.description}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <Badge value={draft.priority} variant="priority" />
                    <Badge value={draft.type} variant="type" />
                  </div>
                </div>
                <button className={styles.remove} onClick={() => handleRemove(i)}>×</button>
              </div>
            ))}
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.footer}>
            <Button variant="ghost" onClick={() => setDrafts(null)}>Back</Button>
            <Button onClick={handleConfirm} disabled={drafts.length === 0 || loading}>
              {loading ? 'Creating…' : `Add ${drafts.length} card${drafts.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
