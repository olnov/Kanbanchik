import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dto/create-team.dto';

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

  create(dto: CreateTeamDto): Promise<Team> {
    return this.repo.save(this.repo.create(dto));
  }
}
