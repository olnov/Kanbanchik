import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { User } from '../../modules/users/user.entity';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
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
