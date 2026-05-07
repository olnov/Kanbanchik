import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn, OneToMany, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Team } from '../teams/team.entity';
import { ProjectTeamPermission } from './project-team-permission.entity';

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ required: false })
  @Column({ type: 'uuid', nullable: true })
  teamId: string | null;

  @ManyToOne(() => Team, { nullable: true, eager: false })
  @JoinColumn({ name: 'teamId' })
  team: Team | null;

  @ApiProperty({ type: () => ProjectTeamPermission, isArray: true })
  @OneToMany(() => ProjectTeamPermission, (permission) => permission.project, {
    eager: true,
  })
  teamPermissions: ProjectTeamPermission[];

  @ApiProperty({ required: false, nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
