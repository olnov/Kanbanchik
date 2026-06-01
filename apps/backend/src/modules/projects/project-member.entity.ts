import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { User } from '../users/user.entity';

export enum ProjectPermissionLevel {
  VIEWER = 'viewer',
  COLLABORATOR = 'collaborator',
  ADMIN = 'admin',
}

@Entity('project_members')
@Unique(['projectId', 'userId'])
export class ProjectMember {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  projectId: string;

  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ApiProperty({ enum: ProjectPermissionLevel })
  @Column({
    type: 'enum',
    enum: ProjectPermissionLevel,
    default: ProjectPermissionLevel.VIEWER,
  })
  role: ProjectPermissionLevel;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
