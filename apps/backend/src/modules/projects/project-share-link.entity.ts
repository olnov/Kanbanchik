import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { ProjectPermissionLevel } from './project-member.entity';

@Entity('project_share_links')
@Unique(['projectId'])
export class ProjectShareLink {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  projectId: string;

  @ApiProperty()
  @Column({ unique: true })
  token: string;

  @ApiProperty({ enum: ProjectPermissionLevel })
  @Column({ type: 'enum', enum: ProjectPermissionLevel, default: ProjectPermissionLevel.VIEWER })
  role: ProjectPermissionLevel;

  @ApiProperty()
  @Column({ default: true })
  enabled: boolean;

  @ApiProperty()
  @Column('uuid')
  createdById: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
