import { Test } from '@nestjs/testing';
import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGuard } from './user.guard';
import { User } from '../../modules/users/user.entity';

const mockUserRepo = { findOneBy: jest.fn() };

describe('UserGuard', () => {
  let guard: UserGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    guard = module.get(UserGuard);
    reflector = module.get(Reflector);
    jest.clearAllMocks();
  });

  function makeCtx(headers: Record<string, string>, isPublic = false): ExecutionContext {
    reflector.getAllAndOverride.mockReturnValue(isPublic);
    const request: Record<string, unknown> = { headers };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it('passes through public endpoints without checking the header', async () => {
    const ctx = makeCtx({}, true);
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockUserRepo.findOneBy).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when X-User-Id header is missing', async () => {
    const ctx = makeCtx({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when user is not found', async () => {
    mockUserRepo.findOneBy.mockResolvedValue(null);
    const ctx = makeCtx({ 'x-user-id': 'unknown-id' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(BadRequestException);
  });

  it('sets request.currentUser and returns true for valid user', async () => {
    const user = { id: 'user-1', name: 'Alice' };
    mockUserRepo.findOneBy.mockResolvedValue(user);
    const request: Record<string, unknown> = { headers: { 'x-user-id': 'user-1' } };
    reflector.getAllAndOverride.mockReturnValue(false);
    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(request.currentUser).toBe(user);
  });
});
