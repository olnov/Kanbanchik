'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { Board } from '@/components/board/Board';
import { CardModal } from '@/components/board/CardModal';
import { AiImportModal } from '@/components/board/AiImportModal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { BoardData, Card, User } from '@/lib/types';
import styles from './page.module.css';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<BoardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [addToStage, setAddToStage] = useState<string | null>(null);
  const [showAiImport, setShowAiImport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    try {
      const [board, allUsers] = await Promise.all([
        api.getBoard(id),
        api.getUsers(),
      ]);
      setData(board);
      setUsers(allUsers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    }
  }, [id]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  if (error) return <div className={styles.status}>{error}</div>;
  if (!data) return <div className={styles.status}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{data.project.name}</h1>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => setShowAiImport(true)}>
            Import from spec
          </Button>
        </div>
      </div>

      <Board
        data={data}
        users={users}
        onCardClick={setSelectedCard}
        onAddCard={setAddToStage}
        myPermission={data.myPermission}
      />

      {selectedCard && (
        <CardModal
          card={selectedCard}
          users={users}
          myPermission={data.myPermission}
          onClose={() => setSelectedCard(null)}
          onSave={async (updated) => {
            await api.updateCard(updated.id!, updated);
            setSelectedCard(null);
            loadBoard();
          }}
          onDelete={async (cardId) => {
            await api.deleteCard(cardId);
            setSelectedCard(null);
            loadBoard();
          }}
        />
      )}

      {addToStage && (
        <CardModal
          card={null}
          stageId={addToStage}
          projectId={id}
          users={users}
          onClose={() => setAddToStage(null)}
          onSave={async (newCard) => {
            await api.createCard(newCard as Card);
            setAddToStage(null);
            loadBoard();
          }}
          onDelete={async () => {
            setAddToStage(null);
          }}
        />
      )}

      {showAiImport && (
        <AiImportModal
          projectId={id}
          stages={data.stages}
          onClose={() => setShowAiImport(false)}
          onConfirm={async () => {
            setShowAiImport(false);
            loadBoard();
          }}
        />
      )}
    </div>
  );
}
