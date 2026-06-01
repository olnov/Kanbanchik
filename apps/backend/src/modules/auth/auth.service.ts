import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.userRepo.findOneBy({ email: dto.email });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const saved = await this.userRepo.save(
      this.userRepo.create({
        name: dto.name.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email,
        role: '',
        passwordHash,
      }),
    );
    return this.userRepo.findOneByOrFail({ id: saved.id });
  }

  async login(dto: LoginDto): Promise<User> {
    const userWithHash = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!userWithHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, userWithHash.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.userRepo.findOneByOrFail({ id: userWithHash.id });
  }

  signToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }
}
