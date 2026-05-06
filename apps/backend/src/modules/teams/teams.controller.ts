import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';

@ApiTags('teams')
@ApiSecurity('x-user-id')
@Controller('teams')
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateTeamDto) { return this.service.create(dto); }
}
