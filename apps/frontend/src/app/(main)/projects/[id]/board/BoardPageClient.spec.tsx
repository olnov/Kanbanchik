/// <reference types="jest" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BoardPageClient } from './BoardPageClient';
import { api } from '@/lib/api';
import { filterCards } from '@/lib/filterCards';
import type { BoardData, Card } from '@/lib/types';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { id: 'user-1' } }),
}));

jest.mock('@/lib/api', () => ({
  api: {
    getBoard: jest.fn(),
    getProjectAssignees: jest.fn(),
    updateCard: jest.fn(),
    deleteCard: jest.fn(),
    createCard: jest.fn(),
  },
}));

jest.mock('@/lib/filterCards', () => ({
  filterCards: jest.fn((cards: Card[]) => cards),
  EMPTY_FILTER: { keyword: '', noAssignee: false, assignedToMe: false, memberIds: [] },
  isFilterActive: jest.fn(() => false),
}));

jest.mock('@/components/board/BoardTopbar', () => ({
  BoardTopbar: () => null,
}));

jest.mock('@/components/board/Board', () => ({
  Board: ({ data, onCardClick }: { data: BoardData; onCardClick: (card: Card) => void }) => (
    <button type="button" onClick={() => onCardClick(data.cards[0])}>
      Open first card
    </button>
  ),
}));

jest.mock('@/components/board/CardModal', () => ({
  CardModal: ({ card, onClose }: { card: Card | null; onClose: () => void }) => (
    <div>
      <span>{card?.summary}</span>
      <button type="button" onClick={onClose}>
        Close card
      </button>
    </div>
  ),
}));

jest.mock('@/components/board/AiImportModal', () => ({
  AiImportModal: () => null,
}));

jest.mock('@/components/board/ProjectSettingsModal', () => ({
  ProjectSettingsModal: () => null,
}));

const card: Card = {
  id: 'card-1',
  summary: 'Linked card',
  description: null,
  type: 'task',
  priority: 'medium',
  order: 0,
  dueDate: null,
  projectId: 'project-1',
  stageId: 'stage-1',
  assigneeId: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

const board: BoardData = {
  project: {
    id: 'project-1',
    name: 'Project',
    createdById: 'user-1',
    cardCodeEnabled: true,
    cardCodePattern: '{PROJECT:4}-{NUMBER}',
    nextCardNumber: 2,
  },
  stages: [{ id: 'stage-1', name: 'To Do', order: 0, projectId: 'project-1' }],
  cards: [card],
  myPermission: 'admin',
};

const mockGetBoard = api.getBoard as jest.MockedFunction<typeof api.getBoard>;
const mockGetProjectAssignees = api.getProjectAssignees as jest.MockedFunction<
  typeof api.getProjectAssignees
>;
const mockFilterCards = filterCards as jest.MockedFunction<typeof filterCards>;

describe('BoardPageClient card routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockGetBoard.mockResolvedValue(board);
    mockGetProjectAssignees.mockResolvedValue([]);
    mockFilterCards.mockImplementation((cards) => cards);
  });

  it('opens the route card even when filters hide it from the board', async () => {
    mockFilterCards.mockReturnValue([]);

    render(<BoardPageClient projectId="project-1" cardId="card-1" />);

    expect(await screen.findByText('Linked card')).toBeInTheDocument();
  });

  it('navigates to the card route when a card is clicked', async () => {
    const user = userEvent.setup();
    render(<BoardPageClient projectId="project-1" />);

    await user.click(await screen.findByRole('button', { name: 'Open first card' }));

    expect(mockPush).toHaveBeenCalledWith('/projects/project-1/board/cards/card-1');
  });

  it('navigates to the board route when the linked card is closed', async () => {
    const user = userEvent.setup();
    render(<BoardPageClient projectId="project-1" cardId="card-1" />);

    await user.click(await screen.findByRole('button', { name: 'Close card' }));

    expect(mockPush).toHaveBeenCalledWith('/projects/project-1/board');
  });

  it('offers a board return when the route card is absent', async () => {
    const user = userEvent.setup();
    render(<BoardPageClient projectId="project-1" cardId="missing" />);

    expect(await screen.findByText('Card not found in this project')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Return to board' }));

    expect(mockPush).toHaveBeenCalledWith('/projects/project-1/board');
  });
});
