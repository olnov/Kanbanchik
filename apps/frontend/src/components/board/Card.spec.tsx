import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@hello-pangea/dnd', () => ({
  Draggable: ({ children }: any) =>
    children({ innerRef: () => {}, draggableProps: {}, dragHandleProps: {} }, { isDragging: false }),
}));

import { Card } from './Card';
import type { Card as CardType } from '@/lib/types';

const mockCard: CardType = {
  id: 'card-1',
  summary: 'Build login page',
  description: null,
  type: 'story',
  priority: 'high',
  order: 0,
  dueDate: null,
  projectId: 'proj-1',
  stageId: 'stage-1',
  assigneeId: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Card', () => {
  it('renders card summary', () => {
    render(<Card card={mockCard} index={0} onClick={() => {}} />);
    expect(screen.getByText('Build login page')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(<Card card={mockCard} index={0} onClick={() => {}} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });
});
