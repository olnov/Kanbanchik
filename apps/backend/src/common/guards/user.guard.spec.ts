import { Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGuard } from './user.guard';
import { User } from '../../modules/users/user.entity';

const mockUserRepo = { findOneBy: jest.fn() };
const mockJwt = { verify: jest.fn() };

function makeCtx(cookies: Record<string, string>, isPublic = false): ExecutionContext {
  const request = { cookies };
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('UserGuard', () => {
  let guard: UserGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UserGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    guard = module.get(UserGuard);
    reflector = module.get(Reflector);
  });

  it('passes through public endpoints without checking cookie', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = makeCtx({}, true);
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockUserRepo.findOneBy).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when cookie is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    await expect(guard.canActivate(makeCtx({}))).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when JWT is invalid', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    mockJwt.verify.mockImplementation(() => { throw new Error('bad'); });
    await expect(guard.canActivate(makeCtx({ access_token: 'bad' }))).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when user not found', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    mockJwt.verify.mockReturnValue({ sub: 'u1' });
    mockUserRepo.findOneBy.mockResolvedValue(null);
    await expect(guard.canActivate(makeCtx({ access_token: 'tok' }))).rejects.toThrow(UnauthorizedException);
  });

  it('sets currentUser and returns true for valid token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    mockJwt.verify.mockReturnValue({ sub: 'u1' });
    const user = { id: 'u1' };
    mockUserRepo.findOneBy.mockResolvedValue(user);
    const request: Record<string, unknown> = { cookies: { access_token: 'tok' } };
    const ctx = {
      getHandler: jest.fn(), getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(request.currentUser).toBe(user);
  });
});
