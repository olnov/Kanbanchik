import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Project } from '../modules/projects/project.entity';
import { ProjectMember, ProjectPermissionLevel } from '../modules/projects/project-member.entity';
import { Stage } from '../modules/stages/stage.entity';
import { Card } from '../modules/cards/card.entity';
import { DEFAULT_PROJECT_STAGES } from './project-defaults';

export async function seedDemoWorkspace(
  manager: EntityManager,
  options: { reset?: boolean } = {},
) {
  const userRepo = manager.getRepository(User);
  const projectRepo = manager.getRepository(Project);
  const memberRepo = manager.getRepository(ProjectMember);
  const stageRepo = manager.getRepository(Stage);
  const cardRepo = manager.getRepository(Card);

  if (options.reset) {
    await cardRepo.createQueryBuilder().delete().execute();
    await stageRepo.createQueryBuilder().delete().execute();
    await memberRepo.createQueryBuilder().delete().execute();
    await projectRepo.createQueryBuilder().delete().execute();
    await userRepo.createQueryBuilder().delete().execute();
  }

  const hash = await bcrypt.hash('password123', 10);

  let users = await userRepo.find({ order: { name: 'ASC', lastName: 'ASC' } });
  if (users.length === 0) {
    users = await userRepo.save([
      userRepo.create({ name: 'Alice', lastName: 'Johnson', email: 'alice@example.com', role: 'developer', competencies: ['typescript', 'react'], availability: 'available', passwordHash: hash }),
      userRepo.create({ name: 'Bob', lastName: 'Smith', email: 'bob@example.com', role: 'designer', competencies: ['figma', 'css'], availability: 'available', passwordHash: hash }),
      userRepo.create({ name: 'Carol', lastName: 'Taylor', email: 'carol@example.com', role: 'product manager', competencies: ['planning'], availability: 'partial', passwordHash: hash }),
    ]);
  }

  const [alice, bob, carol] = users;

  let project = await projectRepo.findOne({ where: { name: 'Alpha Project' } });
  if (!project) {
    project = await projectRepo.save(
      projectRepo.create({ name: 'Alpha Project', createdById: alice.id }),
    );
  } else if (!project.createdById) {
    project.createdById = alice.id;
    project = await projectRepo.save(project);
  }

  const existingMembers = await memberRepo.find({ where: { projectId: project.id } });
  if (existingMembers.length === 0) {
    await memberRepo.save([
      memberRepo.create({ projectId: project.id, userId: bob.id, role: ProjectPermissionLevel.COLLABORATOR }),
      memberRepo.create({ projectId: project.id, userId: carol.id, role: ProjectPermissionLevel.VIEWER }),
    ]);
  }

  let stages = await stageRepo.find({ where: { projectId: project.id }, order: { order: 'ASC' } });
  if (stages.length === 0) {
    stages = await stageRepo.save(
      DEFAULT_PROJECT_STAGES.map((s) => stageRepo.create({ ...s, projectId: project!.id })),
    );
  }

  const stageByName = Object.fromEntries(stages.map((s) => [s.name, s]));
  if (await cardRepo.count({ where: { projectId: project.id } }) === 0) {
    await cardRepo.save([
      cardRepo.create({ summary: 'Set up monorepo', type: 'task', priority: 'high', order: 0, projectId: project.id, stageId: stageByName.Done.id, assigneeId: alice.id, description: 'Initialize pnpm workspace.' }),
      cardRepo.create({ summary: 'Design database schema', type: 'task', priority: 'high', order: 0, projectId: project.id, stageId: stageByName['In Progress'].id, assigneeId: bob.id, description: 'Define all entities.' }),
      cardRepo.create({ summary: 'Build board UI', type: 'story', priority: 'high', order: 100, projectId: project.id, stageId: stageByName['In Progress'].id, assigneeId: alice.id, description: 'Implement the Kanban board.' }),
      cardRepo.create({ summary: 'Add drag and drop', type: 'task', priority: 'medium', order: 0, projectId: project.id, stageId: stageByName['To Do'].id, assigneeId: alice.id, description: 'Integrate @hello-pangea/dnd.' }),
      cardRepo.create({ summary: 'Write API docs', type: 'task', priority: 'low', order: 0, projectId: project.id, stageId: stageByName.Review.id, assigneeId: carol.id, description: 'Add Swagger decorators.' }),
    ]);
  }

  return { users, project, stages };
}
