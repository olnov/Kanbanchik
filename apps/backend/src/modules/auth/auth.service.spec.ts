import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';

const mockUserRepo = {
  findOneBy: jest.fn(),
  findOneByOrFail: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};
const mockJwt = { sign: jest.fn().mockReturnValue('token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwt },
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

  it('signToken delegates to JwtService.sign', () => {
    const token = service.signToken('u1');
    expect(mockJwt.sign).toHaveBeenCalledWith({ sub: 'u1' });
    expect(token).toBe('token');
  });
});
