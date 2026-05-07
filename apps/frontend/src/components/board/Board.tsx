'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DragDropContext, Draggable, Droppable, DropResult,
} from '@hello-pangea/dnd';
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
  const [stages, setStages] = useState(initialData.stages);
  const [cards, setCards] = useState(initialData.cards);
  const [newStageName, setNewStageName] = useState('');
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [busyStageId, setBusyStageId] = useState<string | null>(null);
  const [creatingStage, setCreatingStage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStages(initialData.stages);
  }, [initialData.stages]);

  useEffect(() => {
    setCards(initialData.cards);
  }, [initialData.cards]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const {
      source, destination, draggableId, type,
    } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'COLUMN') {
      const previousStages = stages;
      const reorderedStages = [...stages];
      const [movedStage] = reorderedStages.splice(source.index, 1);
      reorderedStages.splice(destination.index, 0, movedStage);
      const normalizedStages = reorderedStages.map((stage, index) => ({
        ...stage,
        order: index * 100,
      }));

      setStages(normalizedStages);
      setError(null);

      try {
        const persistedStages = await api.reorderStages(
          initialData.project.id,
          normalizedStages.map((stage) => stage.id),
        );
        setStages(persistedStages);
      } catch (err) {
        setStages(previousStages);
        setError(err instanceof Error ? err.message : 'Failed to reorder lists');
      }

      return;
    }

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
  }, [initialData.cards, initialData.project.id, stages]);

  const handleCreateStage = useCallback(async () => {
    const name = newStageName.trim();
    if (!name) {
      return;
    }

    setCreatingStage(true);
    setError(null);

    try {
      const stage = await api.createStage(initialData.project.id, { name });
      setStages((current) => [...current, stage].sort((a, b) => a.order - b.order));
      setNewStageName('');
      setIsAddingStage(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create list');
    } finally {
      setCreatingStage(false);
    }
  }, [initialData.project.id, newStageName]);

  const handleRenameStage = useCallback(async (stageId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('List name cannot be empty');
    }

    setBusyStageId(stageId);
    setError(null);

    try {
      const updatedStage = await api.updateStage(stageId, { name: trimmedName });
      setStages((current) => current.map((stage) => (stage.id === stageId ? updatedStage : stage)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename list';
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setBusyStageId(null);
    }
  }, []);

  const handleDeleteStage = useCallback(async (stageId: string) => {
    if (cards.some((card) => card.stageId === stageId)) {
      setError('Move or delete all cards in this list before removing it.');
      return;
    }

    setBusyStageId(stageId);
    setError(null);

    try {
      await api.deleteStage(stageId);
      setStages((current) => current.filter((stage) => stage.id !== stageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
    } finally {
      setBusyStageId(null);
    }
  }, [cards]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.boardWrap}>
        {error && <div className={styles.error}>{error}</div>}
        <Droppable droppableId="board-columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={styles.boardScroller}
            >
              <div className={styles.board}>
                {stages.map((stage, i) => (
                  <Draggable key={stage.id} draggableId={`stage:${stage.id}`} index={i}>
                    {(stageProvided, snapshot) => (
                      <Column
                        stage={stage}
                        stageIndex={i}
                        cards={cards.filter((c) => c.stageId === stage.id).sort((a, b) => a.order - b.order)}
                        users={users}
                        onCardClick={onCardClick}
                        onAddCard={onAddCard}
                        onRenameStage={handleRenameStage}
                        onDeleteStage={handleDeleteStage}
                        isBusy={busyStageId === stage.id}
                        innerRef={stageProvided.innerRef}
                        draggableProps={stageProvided.draggableProps}
                        dragHandleProps={stageProvided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <div className={styles.addListColumn}>
                  {isAddingStage ? (
                    <div className={styles.addListCard}>
                      <input
                        className={styles.addListInput}
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void handleCreateStage();
                          }

                          if (e.key === 'Escape') {
                            setIsAddingStage(false);
                            setNewStageName('');
                          }
                        }}
                        placeholder="List title"
                        autoFocus
                      />
                      <div className={styles.addListActions}>
                        <button
                          type="button"
                          className={styles.addListConfirm}
                          onClick={() => void handleCreateStage()}
                          disabled={creatingStage || !newStageName.trim()}
                        >
                          {creatingStage ? 'Adding...' : 'Add list'}
                        </button>
                        <button
                          type="button"
                          className={styles.addListCancel}
                          onClick={() => {
                            setIsAddingStage(false);
                            setNewStageName('');
                          }}
                          disabled={creatingStage}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.addListTrigger}
                      onClick={() => {
                        setIsAddingStage(true);
                        setError(null);
                      }}
                    >
                      + Add another list
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
