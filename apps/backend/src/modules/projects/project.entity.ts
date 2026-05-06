import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Team } from '../teams/team.entity';

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  teamId: string | null;

  @ManyToOne(() => Team, { nullable: true, eager: false })
  team: Team | null;

  @ApiProperty({ required: false, nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
