'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { Board } from '@/components/board/Board';
import { CardModal } from '@/components/board/CardModal';
import { AiImportModal } from '@/components/board/AiImportModal';
import { ProjectSettingsModal } from '@/components/board/ProjectSettingsModal';
import { BoardTopbar } from '@/components/board/BoardTopbar';
import { useAuth } from '@/contexts/AuthContext';
import { filterCards, EMPTY_FILTER } from '@/lib/filterCards';
import type { BoardFilter } from '@/lib/filterCards';
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
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<BoardFilter>(EMPTY_FILTER);

  const loadBoard = useCallback(async () => {
    try {
      const [board, projectUsers] = await Promise.all([
        api.getBoard(id),
        api.getProjectAssignees(id),
      ]);
      setData(board);
      setUsers(projectUsers);
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

  const filteredData: BoardData = {
    ...data,
    cards: filterCards(data.cards, filter, currentUser?.id),
  };

  return (
    <div className={styles.page}>
      <BoardTopbar
        projectName={data.project.name}
        filter={filter}
        onFilterChange={setFilter}
        users={users}
        currentUserId={currentUser?.id}
        canImport={data.myPermission !== 'viewer'}
        onOpenSettings={() => setShowSettings(true)}
        onOpenImport={() => setShowAiImport(true)}
      />

      <Board
        data={filteredData}
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

      {showSettings && (
        <ProjectSettingsModal
          projectId={id}
          onClose={() => setShowSettings(false)}
          onChange={loadBoard}
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
