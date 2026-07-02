import type { FastifyReply } from 'fastify';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const user = { id: 'u1', email: 'a@b.com' };
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    loginWithMattermost: jest.fn(),
    signToken: jest.fn(),
  };

  function makeReply() {
    return {
      setCookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as FastifyReply & { setCookie: jest.Mock };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    authService.signToken.mockReturnValue('token');
  });

  it('sets a secure cross-site auth cookie in production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    authService.login.mockResolvedValue(user);
    const controller = new AuthController(authService as never);
    const reply = makeReply();

    try {
      await controller.login({ email: 'a@b.com', password: 'password123' }, reply);

      expect(reply.setCookie).toHaveBeenCalledWith('access_token', 'token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
      });
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
});
