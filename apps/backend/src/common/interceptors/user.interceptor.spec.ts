import { BadRequestException } from '@nestjs/common';
import { UserInterceptor } from './user.interceptor';
import { of } from 'rxjs';

const makeCtx = (headers: Record<string, string>) => ({
  switchToHttp: () => ({
    getRequest: () => ({ headers }),
  }),
});

const next = { handle: () => of(null) };

describe('UserInterceptor', () => {
  let interceptor: UserInterceptor;
  const mockUserRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(() => {
    interceptor = new UserInterceptor(mockUserRepo as any);
    jest.clearAllMocks();
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
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) };
    await interceptor.intercept(ctx as any, next as any);
    expect(req.currentUser).toEqual(user);
  });
});
