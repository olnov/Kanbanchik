import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/user.entity';
import { Team } from '../modules/teams/team.entity';
import { Project } from '../modules/projects/project.entity';
import { Stage } from '../modules/stages/stage.entity';
import { Card } from '../modules/cards/card.entity';

dotenv.config();

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Team, Project, Stage, Card],
  synchronize: true,
});

async function seed() {
  await ds.initialize();

  // Clear in dependency order
  await ds.getRepository(Card).delete({});
  await ds.getRepository(Stage).delete({});
  await ds.getRepository(Project).delete({});
  await ds.getRepository(Team).delete({});
  await ds.getRepository(User).delete({});

  const userRepo = ds.getRepository(User);
  const alice = await userRepo.save(userRepo.create({
    name: 'Alice', email: 'alice@example.com', role: 'developer',
    competencies: ['typescript', 'react'], availability: 'available',
  }));
  const bob = await userRepo.save(userRepo.create({
    name: 'Bob', email: 'bob@example.com', role: 'designer',
    competencies: ['figma', 'css'], availability: 'available',
  }));
  const carol = await userRepo.save(userRepo.create({
    name: 'Carol', email: 'carol@example.com', role: 'product manager',
    competencies: ['planning', 'stakeholder management'], availability: 'partial',
  }));

  const team = await ds.getRepository(Team).save(
    ds.getRepository(Team).create({ name: 'Core Team' }),
  );

  const project = await ds.getRepository(Project).save(
    ds.getRepository(Project).create({ name: 'Alpha Project', teamId: team.id }),
  );

  const stageRepo = ds.getRepository(Stage);
  const [todo, inProgress, review, done] = await stageRepo.save([
    stageRepo.create({ name: 'To Do', order: 0, projectId: project.id }),
    stageRepo.create({ name: 'In Progress', order: 100, projectId: project.id }),
    stageRepo.create({ name: 'Review', order: 200, projectId: project.id }),
    stageRepo.create({ name: 'Done', order: 300, projectId: project.id }),
  ]);

  const cardRepo = ds.getRepository(Card);
  await cardRepo.save([
    cardRepo.create({ summary: 'Set up monorepo', type: 'task', priority: 'high', order: 0, projectId: project.id, stageId: done.id, assigneeId: alice.id, description: 'Initialize pnpm workspace.' }),
    cardRepo.create({ summary: 'Design database schema', type: 'task', priority: 'high', order: 0, projectId: project.id, stageId: inProgress.id, assigneeId: bob.id, description: 'Define all entities and relationships.' }),
    cardRepo.create({ summary: 'Build board UI', type: 'story', priority: 'high', order: 100, projectId: project.id, stageId: inProgress.id, assigneeId: alice.id, description: 'Implement the Kanban board with columns and cards.' }),
    cardRepo.create({ summary: 'Add drag and drop', type: 'task', priority: 'medium', order: 0, projectId: project.id, stageId: todo.id, assigneeId: alice.id, description: 'Integrate @hello-pangea/dnd into the board.' }),
    cardRepo.create({ summary: 'Write API docs', type: 'task', priority: 'low', order: 0, projectId: project.id, stageId: review.id, assigneeId: carol.id, description: 'Ensure all endpoints have Swagger decorators.' }),
  ]);

  console.log('Seed complete.');
  await ds.destroy();
}

seed().catch((e) => { console.error(e); process.exit(1); });
