'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Board } from '@/components/board/Board';
import { CardModal } from '@/components/board/CardModal';
import { AiImportModal } from '@/components/board/AiImportModal';
import { ProjectSettingsModal } from '@/components/board/ProjectSettingsModal';
import { BoardTopbar } from '@/components/board/BoardTopbar';
import { useAuth } from '@/contexts/AuthContext';
import { boardPath, cardPath } from '@/lib/cardRoutes';
import { filterCards } from '@/lib/filterCards';
import { useBoardFilter } from '@/lib/useBoardFilter';
import { api } from '@/lib/api';
import type { BoardData, Card, User } from '@/lib/types';
import styles from './page.module.css';

interface BoardPageClientProps {
  projectId: string;
  cardId?: string;
}

export function BoardPageClient({ projectId, cardId }: BoardPageClientProps) {
  const router = useRouter();
  const [data, setData] = useState<BoardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [addToStage, setAddToStage] = useState<string | null>(null);
  const [showAiImport, setShowAiImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const [filter, setFilter] = useBoardFilter(projectId);

  const loadBoard = useCallback(async () => {
    try {
      const [board, projectUsers] = await Promise.all([
        api.getBoard(projectId),
        api.getProjectAssignees(projectId),
      ]);
      setData(board);
      setUsers(projectUsers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    }
  }, [projectId]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const filteredData: BoardData | null = useMemo(() => {
    if (!data) return null;
    return {
      ...data,
      cards: filterCards(data.cards, filter, currentUser?.id),
    };
  }, [data, filter, currentUser?.id]);

  const selectedCard = useMemo(
    () => (cardId && data ? (data.cards.find((card) => card.id === cardId) ?? null) : null),
    [cardId, data],
  );
  const linkedCardMissing = Boolean(cardId && data && !selectedCard);
  const closeCard = () => router.push(boardPath(projectId));

  if (error) return <div className={styles.status}>{error}</div>;
  if (!data || !filteredData) return <div className={styles.status}>Loading...</div>;

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
        onCardClick={(card) => router.push(cardPath(projectId, card.id))}
        onAddCard={setAddToStage}
        myPermission={data.myPermission}
      />

      {linkedCardMissing && (
        <div className={styles.cardNotFound} role="alert">
          <span>Card not found in this project</span>
          <button type="button" onClick={closeCard}>
            Return to board
          </button>
        </div>
      )}

      {selectedCard && (
        <CardModal
          card={selectedCard}
          users={users}
          myPermission={data.myPermission}
          onClose={closeCard}
          onSave={async (updated) => {
            await api.updateCard(updated.id!, updated);
            await loadBoard();
            closeCard();
          }}
          onDelete={async (deletedCardId) => {
            await api.deleteCard(deletedCardId);
            await loadBoard();
            closeCard();
          }}
        />
      )}

      {addToStage && (
        <CardModal
          card={null}
          stageId={addToStage}
          projectId={projectId}
          users={users}
          onClose={() => setAddToStage(null)}
          onSave={async (newCard) => {
            await api.createCard(newCard as Card);
            setAddToStage(null);
            await loadBoard();
          }}
          onDelete={async () => {
            setAddToStage(null);
          }}
        />
      )}

      {showSettings && (
        <ProjectSettingsModal
          projectId={projectId}
          onClose={() => setShowSettings(false)}
          onChange={loadBoard}
        />
      )}

      {showAiImport && (
        <AiImportModal
          projectId={projectId}
          stages={data.stages}
          onClose={() => setShowAiImport(false)}
          onConfirm={async () => {
            setShowAiImport(false);
            await loadBoard();
          }}
        />
      )}
    </div>
  );
}
