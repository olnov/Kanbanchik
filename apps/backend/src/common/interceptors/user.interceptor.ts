import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { User } from '../../modules/users/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; currentUser?: User }>();
    const userId = request.headers['x-user-id'];

    if (!userId) {
      throw new BadRequestException('X-User-Id header is required');
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException(`User ${userId} not found`);
    }

    request.currentUser = user;
    return next.handle();
  }
}
