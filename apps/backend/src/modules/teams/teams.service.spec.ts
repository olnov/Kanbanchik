import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { Team } from './team.entity';
import { User } from '../users/user.entity';

const mockUser: User = {
  id: 'user-1',
  name: 'Alice',
  lastName: 'Johnson',
  email: 'alice@example.com',
  role: 'developer',
  competencies: ['typescript'],
  availability: 'available',
  teams: [],
  passwordHash: '',
};

const mockTeam: Team = {
  id: 'team-1',
  name: 'Dev Team',
  members: [mockUser],
  ownedProjects: [],
  projectPermissions: [],
};

const txTeamRepo = {
  create: jest.fn().mockImplementation((value) => value),
  save: jest.fn().mockResolvedValue(mockTeam),
  findOneByOrFail: jest.fn().mockResolvedValue(mockTeam),
};

const txUserRepo = {
  findBy: jest.fn().mockResolvedValue([mockUser]),
};

const mockRepo = {
  find: jest.fn().mockResolvedValue([mockTeam]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockTeam),
  manager: {
    transaction: jest.fn(async (callback: (manager: {
      getRepository: (entity: typeof Team | typeof User) => unknown;
    }) => unknown) => callback({
      getRepository: (entity) => {
        if (entity === Team) return txTeamRepo;
        if (entity === User) return txUserRepo;
        throw new Error(`Unexpected repository request for ${entity.name}`);
      },
    })),
  },
};

describe('TeamsService', () => {
  let service: TeamsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getRepositoryToken(Team), useValue: mockRepo },
        { provide: getRepositoryToken(User), useValue: { findOneBy: jest.fn() } },
      ],
    }).compile();
    service = module.get(TeamsService);
  });

  it('findAll returns teams', async () => {
    expect(await service.findAll()).toEqual([mockTeam]);
  });

  it('creates a team with resolved members', async () => {
    const result = await service.create({ name: ' Dev Team ', memberIds: ['user-1'] });

    expect(mockRepo.manager.transaction).toHaveBeenCalled();
    expect(txUserRepo.findBy).toHaveBeenCalled();
    expect(txTeamRepo.create).toHaveBeenCalledWith({
      name: 'Dev Team',
      members: [mockUser],
    });
    expect(result).toEqual(mockTeam);
  });
});
