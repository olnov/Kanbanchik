'use client';

import { useState } from 'react';
import { Settings, ListFilter, Import } from 'lucide-react';
import { FilterPanel } from './FilterPanel';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { isFilterActive } from '@/lib/filterCards';
import type { BoardFilter } from '@/lib/filterCards';
import type { User } from '@/lib/types';
import styles from './BoardTopbar.module.css';

interface BoardTopbarProps {
  projectName: string;
  filter: BoardFilter;
  onFilterChange: (filter: BoardFilter) => void;
  users: User[];
  currentUserId?: string;
  canImport: boolean;
  onOpenSettings: () => void;
  onOpenImport: () => void;
}

export function BoardTopbar({
  projectName,
  filter,
  onFilterChange,
  users,
  currentUserId,
  canImport,
  onOpenSettings,
  onOpenImport,
}: BoardTopbarProps) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className={styles.header}>
      <h1 className={styles.heading}>{projectName}</h1>
      <div className={styles.actions}>
        <span className={styles.filterWrap}>
          <button
            type="button"
            onClick={() => setShowFilter((v) => !v)}
            title="Filter cards"
            aria-expanded={showFilter}
            className={styles.iconButton}
          >
            <ListFilter size={18} />
            {isFilterActive(filter) && <span className={styles.filterDot} aria-hidden="true" />}
          </button>
          {showFilter && (
            <FilterPanel
              filter={filter}
              onChange={onFilterChange}
              users={users}
              currentUserId={currentUserId}
              onClose={() => setShowFilter(false)}
            />
          )}
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          title="Project settings"
          className={styles.iconButton}
        >
          <Settings size={18} />
        </button>
        {canImport && (
          <button
            type="button"
            className={styles.iconButton}
            title="Import from spec"
            onClick={onOpenImport}
          >
            <Import />
          </button>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}
