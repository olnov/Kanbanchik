import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { Team } from './team.entity';

const mockTeam: Team = { id: 'team-1', name: 'Dev Team' };
const mockRepo = {
  find: jest.fn().mockResolvedValue([mockTeam]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockTeam),
  create: jest.fn().mockReturnValue(mockTeam),
  save: jest.fn().mockResolvedValue(mockTeam),
};

describe('TeamsService', () => {
  let service: TeamsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getRepositoryToken(Team), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(TeamsService);
  });

  it('findAll returns teams', async () => {
    expect(await service.findAll()).toEqual([mockTeam]);
  });
});
