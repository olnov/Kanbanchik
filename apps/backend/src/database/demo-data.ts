import { EntityManager } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Team } from '../modules/teams/team.entity';
import { Project } from '../modules/projects/project.entity';
import { Stage } from '../modules/stages/stage.entity';
import { Card } from '../modules/cards/card.entity';
import { DEFAULT_PROJECT_STAGES } from './project-defaults';

interface SeedDemoWorkspaceOptions {
  reset?: boolean;
}

export async function seedDemoWorkspace(
  manager: EntityManager,
  options: SeedDemoWorkspaceOptions = {},
) {
  const userRepo = manager.getRepository(User);
  const teamRepo = manager.getRepository(Team);
  const projectRepo = manager.getRepository(Project);
  const stageRepo = manager.getRepository(Stage);
  const cardRepo = manager.getRepository(Card);

  if (options.reset) {
    await cardRepo.delete({});
    await stageRepo.delete({});
    await projectRepo.delete({});
    await teamRepo.delete({});
    await userRepo.delete({});
  }

  let users = await userRepo.find({ order: { name: 'ASC' } });
  if (users.length === 0) {
    users = await userRepo.save([
      userRepo.create({
        name: 'Alice',
        email: 'alice@example.com',
        role: 'developer',
        competencies: ['typescript', 'react'],
        availability: 'available',
      }),
      userRepo.create({
        name: 'Bob',
        email: 'bob@example.com',
        role: 'designer',
        competencies: ['figma', 'css'],
        availability: 'available',
      }),
      userRepo.create({
        name: 'Carol',
        email: 'carol@example.com',
        role: 'product manager',
        competencies: ['planning', 'stakeholder management'],
        availability: 'partial',
      }),
    ]);
  }

  const [primaryUser, secondaryUser = primaryUser, tertiaryUser = primaryUser] = users;

  let team = await teamRepo.findOne({ where: { name: 'Core Team' } });
  if (!team) {
    team = await teamRepo.save(teamRepo.create({ name: 'Core Team' }));
  }

  let project = await projectRepo.findOne({ where: { name: 'Alpha Project' } });
  if (!project) {
    project = await projectRepo.save(
      projectRepo.create({ name: 'Alpha Project', teamId: team.id }),
    );
  }

  let stages = await stageRepo.find({ where: { projectId: project.id }, order: { order: 'ASC' } });
  if (stages.length === 0) {
    stages = await stageRepo.save(
      DEFAULT_PROJECT_STAGES.map((stage) => stageRepo.create({ ...stage, projectId: project.id })),
    );
  }

  const stageByName = Object.fromEntries(stages.map((stage) => [stage.name, stage]));
  const cardCount = await cardRepo.count({ where: { projectId: project.id } });

  if (cardCount === 0) {
    await cardRepo.save([
      cardRepo.create({
        summary: 'Set up monorepo',
        type: 'task',
        priority: 'high',
        order: 0,
        projectId: project.id,
        stageId: stageByName.Done.id,
        assigneeId: primaryUser.id,
        description: 'Initialize pnpm workspace.',
      }),
      cardRepo.create({
        summary: 'Design database schema',
        type: 'task',
        priority: 'high',
        order: 0,
        projectId: project.id,
        stageId: stageByName['In Progress'].id,
        assigneeId: secondaryUser.id,
        description: 'Define all entities and relationships.',
      }),
      cardRepo.create({
        summary: 'Build board UI',
        type: 'story',
        priority: 'high',
        order: 100,
        projectId: project.id,
        stageId: stageByName['In Progress'].id,
        assigneeId: primaryUser.id,
        description: 'Implement the Kanban board with columns and cards.',
      }),
      cardRepo.create({
        summary: 'Add drag and drop',
        type: 'task',
        priority: 'medium',
        order: 0,
        projectId: project.id,
        stageId: stageByName['To Do'].id,
        assigneeId: primaryUser.id,
        description: 'Integrate @hello-pangea/dnd into the board.',
      }),
      cardRepo.create({
        summary: 'Write API docs',
        type: 'task',
        priority: 'low',
        order: 0,
        projectId: project.id,
        stageId: stageByName.Review.id,
        assigneeId: tertiaryUser.id,
        description: 'Ensure all endpoints have Swagger decorators.',
      }),
    ]);
  }

  return { users, team, project, stages };
}
