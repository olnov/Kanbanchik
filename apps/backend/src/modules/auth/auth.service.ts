import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MattermostService } from './mattermost.service';
import { GitLabProfile, GitLabService } from './gitlab.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mattermostService: MattermostService,
    private readonly gitlabService: GitLabService,
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

  async loginWithMattermost(loginId: string, password: string): Promise<User> {
    const profile = await this.mattermostService.authenticate(loginId, password);

    const existingByMm = await this.userRepo.findOneBy({ mattermostUserId: profile.id });
    if (existingByMm) return existingByMm;

    const emailTaken = await this.userRepo.findOneBy({ email: profile.email });
    if (emailTaken) {
      throw new ConflictException('An account with this email already exists');
    }

    const saved = await this.userRepo.save(
      this.userRepo.create({
        name: (profile.firstName || profile.username).trim(),
        lastName: profile.lastName.trim(),
        email: profile.email,
        role: '',
        passwordHash: '',
        authProvider: 'mattermost',
        mattermostUserId: profile.id,
      }),
    );
    return this.userRepo.findOneByOrFail({ id: saved.id });
  }

  async loginWithGitLab(code: string): Promise<User> {
    const profile = await this.gitlabService.authenticate(code);
    return this.findOrCreateGitLabUser(profile);
  }

  private async findOrCreateGitLabUser(profile: GitLabProfile): Promise<User> {
    const existingByGitLab = await this.userRepo.findOneBy({ gitlabUserId: profile.id });
    if (existingByGitLab) return existingByGitLab;

    const emailTaken = await this.userRepo.findOneBy({ email: profile.email });
    if (emailTaken) {
      throw new ConflictException('An account with this email already exists');
    }

    const saved = await this.userRepo.save(
      this.userRepo.create({
        name: (profile.firstName || profile.username).trim(),
        lastName: profile.lastName.trim(),
        email: profile.email,
        role: '',
        passwordHash: '',
        authProvider: 'gitlab',
        gitlabUserId: profile.id,
      }),
    );
    return this.userRepo.findOneByOrFail({ id: saved.id });
  }

  signToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }
}
