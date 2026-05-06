import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../projects/project.entity';
import { Stage } from '../stages/stage.entity';
import { User } from '../users/user.entity';

@Entity('cards')
export class Card {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  summary: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @ApiProperty()
  @Column()
  type: string;

  @ApiProperty()
  @Column()
  priority: string;

  @ApiProperty()
  @Column({ default: 0 })
  order: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({ nullable: true, type: 'date' })
  dueDate: string | null;

  @ApiProperty()
  @Column()
  projectId: string;

  @ApiProperty()
  @Column()
  stageId: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ nullable: true })
  assigneeId: string | null;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => Stage, { onDelete: 'CASCADE' })
  stage: Stage;

  @ManyToOne(() => User, { nullable: true })
  assignee: User | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
