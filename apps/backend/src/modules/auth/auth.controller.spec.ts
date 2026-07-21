import type { FastifyReply } from 'fastify';
import { ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  const user = { id: 'u1', email: 'a@b.com' };
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    loginWithMattermost: jest.fn(),
    loginWithGitLab: jest.fn(),
    signToken: jest.fn(),
  };

  function makeReply() {
    return {
      setCookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
      code: jest.fn(),
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
    const controller = new AuthController(
      authService as never,
      { getAuthorizationUrl: jest.fn() } as never,
      { get: jest.fn() } as unknown as ConfigService,
    );
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

  it('sets a lax auth cookie in development to support OAuth callbacks', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    authService.login.mockResolvedValue(user);
    const controller = new AuthController(
      authService as never,
      { getAuthorizationUrl: jest.fn() } as never,
      { get: jest.fn() } as unknown as ConfigService,
    );
    const reply = makeReply();

    try {
      await controller.login({ email: 'a@b.com', password: 'password123' }, reply);

      expect(reply.setCookie).toHaveBeenCalledWith('access_token', 'token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
      });
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('redirects a GitLab email conflict to the login error message', async () => {
    authService.loginWithGitLab.mockRejectedValue(new ConflictException());
    const controller = new AuthController(
      authService as never,
      { getAuthorizationUrl: jest.fn() } as never,
      { get: jest.fn().mockReturnValue('http://localhost:3000') } as unknown as ConfigService,
    );
    const reply = makeReply() as unknown as FastifyReply & {
      code: jest.Mock;
      redirect: jest.Mock;
    };
    reply.code.mockReturnValue(reply);

    await controller.gitLabCallback(
      'code',
      'state',
      undefined,
      { cookies: { gitlab_oauth_state: 'state' } },
      reply,
    );

    expect(reply.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/login?oauth_error=gitlab_email_conflict',
    );
  });

  it('redirects a successful GitLab callback to projects', async () => {
    authService.loginWithGitLab.mockResolvedValue(user);
    const controller = new AuthController(
      authService as never,
      { getAuthorizationUrl: jest.fn() } as never,
      { get: jest.fn().mockReturnValue('http://localhost:3000') } as unknown as ConfigService,
    );
    const reply = makeReply() as unknown as FastifyReply & {
      code: jest.Mock;
      redirect: jest.Mock;
    };
    reply.code.mockReturnValue(reply);

    await controller.gitLabCallback(
      'code',
      'state',
      undefined,
      { cookies: { gitlab_oauth_state: 'state' } },
      reply,
    );

    expect(reply.redirect).toHaveBeenCalledWith('http://localhost:3000/projects');
  });
});
