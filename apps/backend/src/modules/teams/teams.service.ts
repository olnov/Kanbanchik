import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { User } from '../users/user.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
  ) {}

  findAll(): Promise<Team[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<Team> {
    return this.repo.findOneByOrFail({ id });
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    return this.repo.manager.transaction(async (manager) => {
      const teamRepo = manager.getRepository(Team);
      const userRepo = manager.getRepository(User);
      const memberIds = [...new Set(dto.memberIds ?? [])];
      const members = memberIds.length
        ? await userRepo.findBy({ id: In(memberIds) })
        : [];

      if (members.length !== memberIds.length) {
        throw new BadRequestException('One or more team members do not exist');
      }

      const team = await teamRepo.save(teamRepo.create({
        name: dto.name.trim(),
        members,
      }));

      return teamRepo.findOneByOrFail({ id: team.id });
    });
  }
}
