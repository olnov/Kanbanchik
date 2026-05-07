import { useEffect, useState } from 'react';
import type {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from '@hello-pangea/dnd';
import { Droppable } from '@hello-pangea/dnd';
import styles from './Column.module.css';
import { Card } from './Card';
import { AddCardButton } from './AddCardButton';
import type { Stage, Card as CardType, User } from '@/lib/types';

const COLUMN_COLORS: Record<number, { bg: string; color: string }> = {
  0: { bg: 'rgb(248 249 255 / 82%)', color: 'var(--color-indigo)' },
  1: { bg: 'rgb(255 247 237 / 82%)', color: 'var(--color-amber)' },
  2: { bg: 'rgb(253 244 255 / 82%)', color: 'var(--color-purple)' },
  3: { bg: 'rgb(240 253 244 / 82%)', color: 'var(--color-green)' },
};

interface ColumnProps {
  stage: Stage;
  stageIndex: number;
  cards: CardType[];
  users: User[];
  onCardClick: (card: CardType) => void;
  onAddCard: (stageId: string) => void;
  onRenameStage: (stageId: string, name: string) => Promise<void>;
  onDeleteStage: (stageId: string) => Promise<void>;
  isBusy: boolean;
  innerRef?: (element: HTMLDivElement | null) => void;
  draggableProps?: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
}

export function Column({
  stage,
  stageIndex,
  cards,
  users,
  onCardClick,
  onAddCard,
  onRenameStage,
  onDeleteStage,
  isBusy,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging = false,
}: ColumnProps) {
  const colors = COLUMN_COLORS[stageIndex % 4];
  const [draftName, setDraftName] = useState(stage.name);
  const [editingName, setEditingName] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setDraftName(stage.name);
  }, [stage.name]);

  const handleRename = async () => {
    try {
      await onRenameStage(stage.id, draftName);
      setEditingName(false);
      setMenuOpen(false);
    } catch {
      // Board-level error state already handles the message.
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete list "${stage.name}"?`);
    if (!confirmed) {
      return;
    }

    await onDeleteStage(stage.id);
    setMenuOpen(false);
  };

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={`${styles.column} ${isDragging ? styles.columnDragging : ''}`}
      style={{
        background: colors.bg,
        ...draggableProps?.style,
        ...(isDragging ? { zIndex: 1000 } : {}),
      }}
    >
      <div
        className={styles.header}
        {...dragHandleProps}
        style={{ cursor: isDragging ? 'grabbing' : 'move' }}
      >
        <div className={styles.headerMain}>
          {editingName ? (
            <input
              className={styles.titleInput}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={() => {
                setDraftName(stage.name);
                setEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleRename();
                }

                if (e.key === 'Escape') {
                  setDraftName(stage.name);
                  setEditingName(false);
                }
              }}
              disabled={isBusy}
              autoFocus
            />
          ) : (
            <span className={styles.title} style={{ color: colors.color }}>{stage.name}</span>
          )}
          <span className={styles.count}>{cards.length}</span>
        </div>
        <div className={styles.menuWrap}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={`Configure ${stage.name}`}
            disabled={isBusy}
          >
            ...
          </button>
          {menuOpen && (
            <div className={styles.menu}>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  setDraftName(stage.name);
                  setEditingName(true);
                  setMenuOpen(false);
                }}
              >
                Rename list
              </button>
              <button
                type="button"
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                onClick={() => void handleDelete()}
              >
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>
      <Droppable droppableId={stage.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.cards}
          >
            {cards.map((card, i) => (
              <Card
                key={card.id}
                card={card}
                index={i}
                assignee={users.find((u) => u.id === card.assigneeId)}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <AddCardButton onClick={() => onAddCard(stage.id)} />
    </div>
  );
}
