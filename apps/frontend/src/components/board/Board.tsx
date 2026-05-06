'use client';

import { useState, useCallback, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import styles from './Board.module.css';
import { Column } from './Column';
import { api } from '@/lib/api';
import type { BoardData, Card, User } from '@/lib/types';

interface BoardProps {
  data: BoardData;
  users: User[];
  onCardClick: (card: Card) => void;
  onAddCard: (stageId: string) => void;
}

export function Board({ data: initialData, users, onCardClick, onAddCard }: BoardProps) {
  const [cards, setCards] = useState(initialData.cards);
  const { stages } = initialData;

  useEffect(() => {
    setCards(initialData.cards);
  }, [initialData.cards]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setCards((prev) => {
      const updated = prev.filter((c) => c.id !== draggableId);
      const moved = { ...prev.find((c) => c.id === draggableId)!, stageId: destination.droppableId };
      const targetCards = updated.filter((c) => c.stageId === destination.droppableId);
      targetCards.splice(destination.index, 0, moved);
      const otherCards = updated.filter((c) => c.stageId !== destination.droppableId);
      return [
        ...otherCards,
        ...targetCards.map((c, i) => ({ ...c, order: i * 100 })),
      ];
    });

    try {
      await api.moveCard(draggableId, destination.droppableId, destination.index);
    } catch {
      setCards(initialData.cards);
    }
  }, [initialData.cards]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {stages.map((stage, i) => (
          <Column
            key={stage.id}
            stage={stage}
            stageIndex={i}
            cards={cards.filter((c) => c.stageId === stage.id).sort((a, b) => a.order - b.order)}
            users={users}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
