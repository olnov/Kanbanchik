'use client';

import { useEffect, useRef } from 'react';
import { EMPTY_FILTER, isFilterActive } from '@/lib/filterCards';
import type { BoardFilter } from '@/lib/filterCards';
import type { User } from '@/lib/types';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  filter: BoardFilter;
  onChange: (filter: BoardFilter) => void;
  users: User[];
  currentUserId?: string;
  onClose: () => void;
}

export function FilterPanel({ filter, onChange, users, currentUserId, onClose }: FilterPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [onClose]);

  const toggleMember = (id: string) => {
    const next = filter.memberIds.includes(id)
      ? filter.memberIds.filter((m) => m !== id)
      : [...filter.memberIds, id];
    onChange({ ...filter, memberIds: next });
  };

  return (
    <div className={styles.panel} ref={ref} role="dialog" aria-label="Filter cards">
      <div className={styles.header}>
        <span className={styles.title}>Filter cards</span>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close filter">×</button>
      </div>

      <div className={styles.section}>
        <label className={styles.sectionLabel} htmlFor="filter-keyword">Keyword</label>
        <input
          id="filter-keyword"
          className={styles.input}
          value={filter.keyword}
          onChange={(e) => onChange({ ...filter, keyword: e.target.value })}
          placeholder="Enter a keyword..."
          autoFocus
        />
        <p className={styles.hint}>Search cards by summary and description.</p>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Members</span>
        <label className={styles.option}>
          <input
            type="checkbox"
            checked={filter.noAssignee}
            onChange={(e) => onChange({ ...filter, noAssignee: e.target.checked })}
          />
          No assignee
        </label>
        {currentUserId && (
          <label className={styles.option}>
            <input
              type="checkbox"
              checked={filter.assignedToMe}
              onChange={(e) => onChange({ ...filter, assignedToMe: e.target.checked })}
            />
            Assigned to me
          </label>
        )}
        {users.map((u) => (
          <label key={u.id} className={styles.option}>
            <input
              type="checkbox"
              checked={filter.memberIds.includes(u.id)}
              onChange={() => toggleMember(u.id)}
            />
            {`${u.name} ${u.lastName}`.trim()}
          </label>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.clear}
          disabled={!isFilterActive(filter)}
          onClick={() => onChange(EMPTY_FILTER)}
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
