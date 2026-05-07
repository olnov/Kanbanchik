import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<User> {
    return this.repo.findOneByOrFail({ id });
  }

  create(dto: CreateUserDto): Promise<User> {
    return this.repo.save(this.repo.create({
      ...dto,
      name: dto.name.trim(),
      lastName: dto.lastName.trim(),
    }));
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.repo.update(id, {
      ...dto,
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.lastName !== undefined ? { lastName: dto.lastName.trim() } : {}),
    });
    return this.findOne(id);
  }
}
