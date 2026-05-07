import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Team } from '../teams/team.entity';
import { Project } from './project.entity';

export enum ProjectPermissionLevel {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
}

@Entity('project_team_permissions')
@Unique(['projectId', 'teamId'])
export class ProjectTeamPermission {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  projectId: string;

  @ApiProperty()
  @Column('uuid')
  teamId: string;

  @ApiProperty({ enum: ProjectPermissionLevel })
  @Column({
    type: 'enum',
    enum: ProjectPermissionLevel,
    default: ProjectPermissionLevel.VIEWER,
  })
  permission: ProjectPermissionLevel;

  @ManyToOne(() => Project, (project) => project.teamPermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ApiProperty({ type: () => Team })
  @ManyToOne(() => Team, (team) => team.projectPermissions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
