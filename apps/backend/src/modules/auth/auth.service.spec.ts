import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { MattermostService } from './mattermost.service';
import { User } from '../users/user.entity';

const mockUserRepo = {
  findOneBy: jest.fn(),
  findOneByOrFail: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};
const mockJwt = { sign: jest.fn().mockReturnValue('token') };
const mockMattermost = { authenticate: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwt },
        { provide: MattermostService, useValue: mockMattermost },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  describe('register', () => {
    it('throws ConflictException when email already exists', async () => {
      mockUserRepo.findOneBy.mockResolvedValue({ id: 'u1' });
      await expect(service.register({ name: 'A', lastName: 'B', email: 'a@b.com', password: 'pass1234' }))
        .rejects.toThrow(ConflictException);
    });

    it('creates user with hashed password and returns user without hash', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation((v) => v);
      mockUserRepo.save.mockResolvedValue({ id: 'u1' });
      mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

      const result = await service.register({ name: 'Alice', lastName: 'J', email: 'a@b.com', password: 'password123' });
      expect(result).toEqual({ id: 'u1', email: 'a@b.com' });
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: expect.any(String) }),
      );
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      const qb = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null) };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);
      await expect(service.login({ email: 'x@y.com', password: 'abc' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      const qb = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue({ id: 'u1', passwordHash: hash }) };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);
      await expect(service.login({ email: 'x@y.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('returns user without hash on correct credentials', async () => {
      const hash = await bcrypt.hash('secret', 10);
      const qb = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue({ id: 'u1', passwordHash: hash }) };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);
      mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 'u1', email: 'x@y.com' });
      const result = await service.login({ email: 'x@y.com', password: 'secret' });
      expect(result).toEqual({ id: 'u1', email: 'x@y.com' });
    });
  });

  describe('loginWithMattermost', () => {
    const profile = {
      id: 'mm-1', email: 'a@b.com', firstName: 'Al', lastName: 'Ice', username: 'alice',
    };

    it('returns existing user matched by mattermostUserId', async () => {
      mockMattermost.authenticate.mockResolvedValue(profile);
      mockUserRepo.findOneBy.mockImplementation(({ mattermostUserId }) =>
        mattermostUserId === 'mm-1' ? { id: 'u1', email: 'a@b.com' } : null,
      );

      const result = await service.loginWithMattermost('alice', 'pw');

      expect(result).toEqual({ id: 'u1', email: 'a@b.com' });
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when email already belongs to another account', async () => {
      mockMattermost.authenticate.mockResolvedValue(profile);
      mockUserRepo.findOneBy.mockImplementation(({ mattermostUserId, email }) => {
        if (mattermostUserId) return null;
        if (email === 'a@b.com') return { id: 'local-1', email: 'a@b.com' };
        return null;
      });

      await expect(service.loginWithMattermost('alice', 'pw')).rejects.toThrow(ConflictException);
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('provisions a new Mattermost user when no match exists', async () => {
      mockMattermost.authenticate.mockResolvedValue(profile);
      mockUserRepo.findOneBy.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation((v) => v);
      mockUserRepo.save.mockResolvedValue({ id: 'new-1' });
      mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 'new-1', email: 'a@b.com' });

      const result = await service.loginWithMattermost('alice', 'pw');

      expect(result).toEqual({ id: 'new-1', email: 'a@b.com' });
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@b.com',
          name: 'Al',
          lastName: 'Ice',
          authProvider: 'mattermost',
          mattermostUserId: 'mm-1',
          passwordHash: '',
        }),
      );
    });
  });

  it('signToken delegates to JwtService.sign', () => {
    const token = service.signToken('u1');
    expect(mockJwt.sign).toHaveBeenCalledWith({ sub: 'u1' });
    expect(token).toBe('token');
  });
});
