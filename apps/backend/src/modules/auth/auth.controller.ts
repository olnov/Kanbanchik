import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  Query,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { randomBytes, timingSafeEqual } from 'crypto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginMattermostDto } from './dto/login-mattermost.dto';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/user.entity';
import { GitLabService } from './gitlab.service';
import { ConfigService } from '@nestjs/config';

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    secure: isProduction,
    path: '/',
  };
}

function getOAuthStateCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: 600,
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly gitlabService: GitLabService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @Public()
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const user = await this.authService.register(dto);
    reply.setCookie('access_token', this.authService.signToken(user.id), getCookieOptions());
    return user;
  }

  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const user = await this.authService.login(dto);
    reply.setCookie('access_token', this.authService.signToken(user.id), getCookieOptions());
    return user;
  }

  @Post('login/mattermost')
  @Public()
  async loginMattermost(
    @Body() dto: LoginMattermostDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const user = await this.authService.loginWithMattermost(dto.loginId, dto.password);
    reply.setCookie('access_token', this.authService.signToken(user.id), getCookieOptions());
    return user;
  }

  @Get('gitlab')
  @Public()
  loginGitLab(@Res() reply: FastifyReply) {
    const state = randomBytes(32).toString('base64url');
    reply.setCookie('gitlab_oauth_state', state, getOAuthStateCookieOptions());
    return reply.code(302).redirect(this.gitlabService.getAuthorizationUrl(state));
  }

  @Get('gitlab/callback')
  @Public()
  async gitLabCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') gitLabError: string | undefined,
    @Req() req: { cookies: Record<string, string | undefined> },
    @Res() reply: FastifyReply,
  ) {
    const expectedState = req.cookies.gitlab_oauth_state;
    reply.clearCookie('gitlab_oauth_state', { path: '/' });
    if (!state || !expectedState || !sameState(state, expectedState)) {
      throw new UnauthorizedException('Invalid GitLab login state');
    }
    if (gitLabError || !code) {
      return reply.code(302).redirect(this.frontendLoginUrl('gitlab_authorization_failed'));
    }

    try {
      const user = await this.authService.loginWithGitLab(code);
      reply.setCookie('access_token', this.authService.signToken(user.id), getCookieOptions());
      return reply.code(302).redirect(this.frontendUrl('/projects').toString());
    } catch (error) {
      if (error instanceof ConflictException) {
        return reply.code(302).redirect(this.frontendLoginUrl('gitlab_email_conflict'));
      }
      return reply.code(302).redirect(this.frontendLoginUrl('gitlab_login_failed'));
    }
  }

  @Post('logout')
  @Public()
  logout(@Res({ passthrough: true }) reply: FastifyReply) {
    reply.clearCookie('access_token', { path: '/' });
    return { message: 'Logged out' };
  }

  @Get('me')
  me(@Req() req: { currentUser: User }) {
    return req.currentUser;
  }

  private frontendLoginUrl(error?: string): string {
    const url = this.frontendUrl('/login');
    if (error) url.searchParams.set('oauth_error', error);
    return url.toString();
  }

  private frontendUrl(path: string): URL {
    return new URL(path, this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000');
  }
}

function sameState(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
