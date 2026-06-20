import { Controller, Post, Get, Body, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginMattermostDto } from './dto/login-mattermost.dto';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/user.entity';

const COOKIE_OPTIONS = { httpOnly: true, sameSite: 'strict' as const, path: '/' };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const user = await this.authService.register(dto);
    reply.setCookie('access_token', this.authService.signToken(user.id), COOKIE_OPTIONS);
    return user;
  }

  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const user = await this.authService.login(dto);
    reply.setCookie('access_token', this.authService.signToken(user.id), COOKIE_OPTIONS);
    return user;
  }

  @Post('login/mattermost')
  @Public()
  async loginMattermost(
    @Body() dto: LoginMattermostDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const user = await this.authService.loginWithMattermost(dto.loginId, dto.password);
    reply.setCookie('access_token', this.authService.signToken(user.id), COOKIE_OPTIONS);
    return user;
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
}
