'use client';

import { useEffect, useState, useCallback } from 'react';
import { Board } from '@/components/board/Board';
import { CardModal } from '@/components/board/CardModal';
import { AiImportModal } from '@/components/board/AiImportModal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { BoardData, Card, User } from '@/lib/types';
import styles from './page.module.css';

export default function BoardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<BoardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [addToStage, setAddToStage] = useState<string | null>(null);
  const [showAiImport, setShowAiImport] = useState(false);

  const loadBoard = useCallback(async () => {
    const [board, allUsers] = await Promise.all([
      api.getBoard(params.id),
      api.getUsers(),
    ]);
    setData(board);
    setUsers(allUsers);
  }, [params.id]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  if (!data) return <div>Loading…</div>;

  return (
    <div>
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
      />

      {selectedCard && (
        <CardModal
          card={selectedCard}
          users={users}
          onClose={() => setSelectedCard(null)}
          onSave={async (updated) => {
            await api.updateCard(updated.id!, updated);
            setSelectedCard(null);
            loadBoard();
          }}
          onDelete={async (id) => {
            await api.deleteCard(id);
            setSelectedCard(null);
            loadBoard();
          }}
        />
      )}

      {addToStage && (
        <CardModal
          card={null}
          stageId={addToStage}
          projectId={params.id}
          users={users}
          onClose={() => setAddToStage(null)}
          onSave={async (newCard) => {
            await api.createCard(newCard as any);
            setAddToStage(null);
            loadBoard();
          }}
          onDelete={async () => { setAddToStage(null); }}
        />
      )}

      {showAiImport && (
        <AiImportModal
          projectId={params.id}
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
