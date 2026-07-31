import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { ProjectMember } from './project-member.entity';

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ default: true })
  @Column({ default: true })
  cardCodeEnabled: boolean;

  @ApiProperty({ default: '{PROJECT:4}-{NUMBER}' })
  @Column({ default: '{PROJECT:4}-{NUMBER}' })
  cardCodePattern: string;

  @ApiProperty({ default: 1 })
  @Column({ type: 'integer', default: 1 })
  nextCardNumber: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  creator: User | null;

  @OneToMany(() => ProjectMember, (m) => m.project)
  members: ProjectMember[];

  @ApiProperty({ required: false, nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
