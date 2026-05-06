import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../projects/project.entity';

@Entity('stages')
export class Stage {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ default: 0 })
  order: number;

  @ApiProperty()
  @Column()
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @ApiProperty({ required: false, nullable: true })
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
