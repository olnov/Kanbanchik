import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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
  @Column({ default: '' })
  role: string;

  @ApiProperty({ type: [String] })
  @Column('simple-array', { default: '' })
  competencies: string[];

  @ApiProperty()
  @Column({ default: 'available' })
  availability: string;

  @ApiProperty()
  @Column({ default: 'local' })
  authProvider: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  mattermostUserId: string | null;

  @Column({ select: false, default: '' })
  passwordHash: string;
}
