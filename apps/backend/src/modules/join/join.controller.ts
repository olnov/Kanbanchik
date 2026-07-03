import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JoinService } from './join.service';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/user.entity';

@ApiTags('join')
@Controller('join')
export class JoinController {
  constructor(private readonly service: JoinService) {}

  @Get(':token')
  @Public()
  preview(@Param('token') token: string) {
    return this.service.getPreview(token);
  }

  @Post(':token/accept')
  accept(@Param('token') token: string, @Req() req: { currentUser: User }) {
    return this.service.accept(token, {
      id: req.currentUser.id,
      email: req.currentUser.email,
    });
  }
}
