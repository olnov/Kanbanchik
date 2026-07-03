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

@Entity('project_invites')
@Unique(['projectId', 'email'])
export class ProjectInvite {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  projectId: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty({ enum: ProjectPermissionLevel })
  @Column({ type: 'enum', enum: ProjectPermissionLevel, default: ProjectPermissionLevel.VIEWER })
  role: ProjectPermissionLevel;

  @ApiProperty()
  @Column({ unique: true })
  token: string;

  @ApiProperty()
  @Column('uuid')
  invitedById: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
