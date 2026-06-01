import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

const mockUser: User = {
  id: 'uuid-1',
  name: 'Alice',
  lastName: 'Johnson',
  email: 'alice@example.com',
  role: 'developer',
  competencies: ['typescript', 'react'],
  availability: 'available',
  passwordHash: '',
};

const mockRepo = {
  find: jest.fn().mockResolvedValue([mockUser]),
  findOneByOrFail: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockReturnValue(mockUser),
  save: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue(undefined),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('findAll returns array of users', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockUser]);
    expect(mockRepo.find).toHaveBeenCalled();
  });

  it('findOne returns a single user', async () => {
    const result = await service.findOne('uuid-1');
    expect(result).toEqual(mockUser);
    expect(mockRepo.findOneByOrFail).toHaveBeenCalledWith({ id: 'uuid-1' });
  });
});
