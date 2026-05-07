import {
  Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { ProjectTeamPermission } from '../projects/project-team-permission.entity';

@Entity('teams')
export class Team {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ type: () => User, isArray: true })
  @ManyToMany(() => User, (user) => user.teams, { eager: true })
  @JoinTable({
    name: 'team_members',
    joinColumn: { name: 'teamId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];

  @OneToMany(() => Project, (project) => project.team)
  ownedProjects: Project[];

  @OneToMany(() => ProjectTeamPermission, (permission) => permission.team)
  projectPermissions: ProjectTeamPermission[];
}
