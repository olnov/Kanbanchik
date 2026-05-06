import { BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserInterceptor } from './user.interceptor';
import { of } from 'rxjs';

const makeCtx = (headers: Record<string, string>) => ({
  getHandler: () => undefined,
  getClass: () => undefined,
  switchToHttp: () => ({
    getRequest: () => ({ headers }),
  }),
});

const next = { handle: () => of(null) };

describe('UserInterceptor', () => {
  let interceptor: UserInterceptor;
  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };
  const mockUserRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(() => {
    interceptor = new UserInterceptor(mockReflector as unknown as Reflector, mockUserRepo as any);
    jest.clearAllMocks();
    mockReflector.getAllAndOverride.mockReturnValue(false);
  });

  it('throws 400 when X-User-Id header is missing', async () => {
    await expect(
      interceptor.intercept(makeCtx({}) as any, next as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws 400 when user does not exist', async () => {
    mockUserRepo.findOneBy.mockResolvedValue(null);
    await expect(
      interceptor.intercept(makeCtx({ 'x-user-id': 'bad-id' }) as any, next as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('attaches user to request when valid', async () => {
    const user = { id: 'uuid-1', name: 'Alice' };
    mockUserRepo.findOneBy.mockResolvedValue(user);
    const req: any = { headers: { 'x-user-id': 'uuid-1' } };
    const ctx = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => req }),
    };
    await interceptor.intercept(ctx as any, next as any);
    expect(req.currentUser).toEqual(user);
  });

  it('skips user lookup for public routes', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);

    await interceptor.intercept(makeCtx({}) as any, next as any);

    expect(mockUserRepo.findOneBy).not.toHaveBeenCalled();
  });
});
