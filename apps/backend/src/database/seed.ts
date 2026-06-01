import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Project } from '../modules/projects/project.entity';
import { ProjectMember } from '../modules/projects/project-member.entity';
import { Stage } from '../modules/stages/stage.entity';
import { Card } from '../modules/cards/card.entity';
import { seedDemoWorkspace } from './demo-data';
import { loadEnvFromFile } from './load-env';

loadEnvFromFile();

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Project, ProjectMember, Stage, Card],
  synchronize: true,
});

async function seed() {
  await ds.initialize();
  await ds.transaction(async (manager) => {
    await seedDemoWorkspace(manager, { reset: true });
  });

  console.log('Seed complete.');
  await ds.destroy();
}

seed().catch((e) => { console.error(e); process.exit(1); });
