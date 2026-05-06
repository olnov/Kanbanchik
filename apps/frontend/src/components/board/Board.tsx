'use client';

import styles from './Board.module.css';
import { Column } from './Column';
import type { BoardData, Card, User } from '@/lib/types';

interface BoardProps {
  data: BoardData;
  users: User[];
  onCardClick: (card: Card) => void;
  onAddCard: (stageId: string) => void;
}

export function Board({ data, users, onCardClick, onAddCard }: BoardProps) {
  const { stages, cards } = data;

  return (
    <div className={styles.board}>
      {stages.map((stage, i) => (
        <Column
          key={stage.id}
          stage={stage}
          stageIndex={i}
          cards={cards.filter((c) => c.stageId === stage.id)}
          users={users}
          onCardClick={onCardClick}
          onAddCard={onAddCard}
        />
      ))}
    </div>
  );
}
