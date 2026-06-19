import { Test } from '@nestjs/testing';
import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MattermostService } from './mattermost.service';

const config = {
  get: jest.fn((key: string) => {
    if (key === 'MATTERMOST_URL') return 'https://mm.example.com';
    if (key === 'MATTERMOST_ENABLED') return 'true';
    return undefined;
  }),
};

describe('MattermostService', () => {
  let service: MattermostService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        MattermostService,
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get(MattermostService);
  });

  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockRestore?.();
  });

  it('returns a mapped profile on 200', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'mm-1', email: 'a@b.com', first_name: 'Al', last_name: 'Ice', username: 'alice',
      }),
    }) as unknown as typeof fetch;

    const profile = await service.authenticate('alice', 'pw');

    expect(profile).toEqual({
      id: 'mm-1', email: 'a@b.com', firstName: 'Al', lastName: 'Ice', username: 'alice',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://mm.example.com/api/v4/users/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: 'alice', password: 'pw' }),
      }),
    );
  });

  it('throws UnauthorizedException on 401', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 }) as unknown as typeof fetch;
    await expect(service.authenticate('alice', 'bad')).rejects.toThrow(UnauthorizedException);
  });

  it('throws ServiceUnavailableException when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    await expect(service.authenticate('alice', 'pw')).rejects.toThrow(ServiceUnavailableException);
  });

  it('throws ServiceUnavailableException when not configured', async () => {
    config.get.mockReturnValue(undefined);
    await expect(service.authenticate('alice', 'pw')).rejects.toThrow(ServiceUnavailableException);
  });
});
