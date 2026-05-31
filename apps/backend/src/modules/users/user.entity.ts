import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Team } from '../teams/team.entity';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ default: '' })
  lastName: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  role: string;

  @ApiProperty({ type: [String] })
  @Column('simple-array', { default: '' })
  competencies: string[];

  @ApiProperty()
  @Column({ default: 'available' })
  availability: string;

  @ManyToMany(() => Team, (team) => team.members)
  teams: Team[];

  @Column({ select: false, default: '' })
  passwordHash: string;
}
