import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Team } from '../modules/teams/team.entity';
import { Project } from '../modules/projects/project.entity';
import { Stage } from '../modules/stages/stage.entity';
import { Card } from '../modules/cards/card.entity';
import { seedDemoWorkspace } from './demo-data';
import { loadEnvFromFile } from './load-env';

loadEnvFromFile();

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Team, Project, Stage, Card],
  synchronize: true,
});

async function ensureDemo() {
  await ds.initialize();
  await ds.transaction(async (manager) => {
    await seedDemoWorkspace(manager);
  });
  console.log('Demo data ensured.');
  await ds.destroy();
}

ensureDemo().catch((e) => {
  console.error(e);
  process.exit(1);
});
