/// <reference types="jest" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { api } from '@/lib/api';
import type { BoardData } from '@/lib/types';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { id: 'user-1' } }),
}));

jest.mock('@/lib/api', () => ({
  api: {
    getBoard: jest.fn(),
    getProjectMembers: jest.fn(),
    getUsers: jest.fn(),
    getShareLink: jest.fn(),
    updateCardCodeSettings: jest.fn(),
    backfillCardCodes: jest.fn(),
    addProjectMember: jest.fn(),
    createInvite: jest.fn(),
    revokeInvite: jest.fn(),
    saveShareLink: jest.fn(),
    updateProjectMemberRole: jest.fn(),
    removeProjectMember: jest.fn(),
  },
}));

const board: BoardData = {
  project: {
    id: 'proj-1',
    name: 'Alpha',
    createdById: 'user-1',
    cardCodeEnabled: true,
    cardCodePattern: '{PROJECT:4}-{NUMBER}',
    nextCardNumber: 7,
  },
  stages: [],
  cards: [],
  myPermission: 'admin',
};

const mockedApi = api as typeof api & { backfillCardCodes: jest.Mock };
const mockGetBoard = api.getBoard as jest.MockedFunction<typeof api.getBoard>;
const mockGetProjectMembers = api.getProjectMembers as jest.MockedFunction<
  typeof api.getProjectMembers
>;
const mockBackfillCardCodes = mockedApi.backfillCardCodes;

describe('ProjectSettingsModal card-code backfill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockGetBoard.mockResolvedValue(board);
    mockGetProjectMembers.mockResolvedValue({
      members: [],
      invites: [],
      myPermission: 'admin',
    });
    (api.getUsers as jest.Mock).mockResolvedValue([]);
    (api.getShareLink as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generates codes after confirmation and refreshes the board', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    mockBackfillCardCodes.mockResolvedValue({ updatedCount: 2, nextCardNumber: 9 });
    render(<ProjectSettingsModal projectId="proj-1" onClose={jest.fn()} onChange={onChange} />);

    await user.click(
      await screen.findByRole('button', { name: 'Generate codes for existing cards' }),
    );

    expect(mockBackfillCardCodes).toHaveBeenCalledWith('proj-1');
    expect(await screen.findByText('Generated codes for 2 cards')).toBeInTheDocument();
    expect(screen.getByText(/Preview: \[ALPH-9\]/)).toBeInTheDocument();
    expect(screen.queryByText(/Implement backend API/)).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('reports when every existing card already has a code', async () => {
    const user = userEvent.setup();
    mockBackfillCardCodes.mockResolvedValue({ updatedCount: 0, nextCardNumber: 7 });
    render(<ProjectSettingsModal projectId="proj-1" onClose={jest.fn()} />);

    await user.click(
      await screen.findByRole('button', { name: 'Generate codes for existing cards' }),
    );

    expect(await screen.findByText('All existing cards already have codes')).toBeInTheDocument();
  });

  it('does not call the API when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    jest.mocked(window.confirm).mockReturnValue(false);
    render(<ProjectSettingsModal projectId="proj-1" onClose={jest.fn()} />);

    await user.click(
      await screen.findByRole('button', { name: 'Generate codes for existing cards' }),
    );

    expect(mockBackfillCardCodes).not.toHaveBeenCalled();
  });

  it('disables backfill while persisted code settings have unsaved edits', async () => {
    const user = userEvent.setup();
    render(<ProjectSettingsModal projectId="proj-1" onClose={jest.fn()} />);
    const pattern = await screen.findByLabelText('Code pattern');

    await user.type(pattern, '-CHANGED');

    expect(
      screen.getByRole('button', { name: 'Generate codes for existing cards' }),
    ).toBeDisabled();
  });

  it.each([
    [{ cardCodeEnabled: false }, 'disabled generation'],
    [{ cardCodePattern: 'ALPHA' }, 'invalid pattern'],
  ])('disables backfill for %s', async (projectOverrides, _label) => {
    mockGetBoard.mockResolvedValue({
      ...board,
      project: { ...board.project, ...projectOverrides },
    });
    render(<ProjectSettingsModal projectId="proj-1" onClose={jest.fn()} />);

    expect(
      await screen.findByRole('button', { name: 'Generate codes for existing cards' }),
    ).toBeDisabled();
  });

  it('disables the action while backfill is running', async () => {
    const user = userEvent.setup();
    mockBackfillCardCodes.mockReturnValue(new Promise(() => {}));
    render(<ProjectSettingsModal projectId="proj-1" onClose={jest.fn()} />);

    await user.click(
      await screen.findByRole('button', { name: 'Generate codes for existing cards' }),
    );

    expect(await screen.findByRole('button', { name: 'Generating…' })).toBeDisabled();
  });

  it('surfaces a backfill error and allows retry', async () => {
    const user = userEvent.setup();
    mockBackfillCardCodes.mockRejectedValue(new Error('Backfill failed'));
    render(<ProjectSettingsModal projectId="proj-1" onClose={jest.fn()} />);
    const button = await screen.findByRole('button', {
      name: 'Generate codes for existing cards',
    });

    await user.click(button);

    expect(await screen.findByText('Backfill failed')).toBeInTheDocument();
    expect(button).toBeEnabled();
  });
});
