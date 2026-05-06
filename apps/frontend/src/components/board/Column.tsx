import { Droppable } from '@hello-pangea/dnd';
import styles from './Column.module.css';
import { Card } from './Card';
import { AddCardButton } from './AddCardButton';
import type { Stage, Card as CardType, User } from '@/lib/types';

const COLUMN_COLORS: Record<number, { bg: string; color: string }> = {
  0: { bg: 'var(--color-indigo-bg)', color: 'var(--color-indigo)' },
  1: { bg: 'var(--color-amber-bg)', color: 'var(--color-amber)' },
  2: { bg: 'var(--color-purple-bg)', color: 'var(--color-purple)' },
  3: { bg: 'var(--color-green-bg)', color: 'var(--color-green)' },
};

interface ColumnProps {
  stage: Stage;
  stageIndex: number;
  cards: CardType[];
  users: User[];
  onCardClick: (card: CardType) => void;
  onAddCard: (stageId: string) => void;
}

export function Column({ stage, stageIndex, cards, users, onCardClick, onAddCard }: ColumnProps) {
  const colors = COLUMN_COLORS[stageIndex % 4];

  return (
    <div className={styles.column} style={{ background: colors.bg }}>
      <div className={styles.header}>
        <span className={styles.title} style={{ color: colors.color }}>{stage.name}</span>
        <span className={styles.count}>{cards.length}</span>
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
