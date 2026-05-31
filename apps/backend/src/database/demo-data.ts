import { EntityManager } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Team } from '../modules/teams/team.entity';
import { Project } from '../modules/projects/project.entity';
import {
  ProjectPermissionLevel,
  ProjectTeamPermission,
} from '../modules/projects/project-team-permission.entity';
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
  const permissionRepo = manager.getRepository(ProjectTeamPermission);
  const stageRepo = manager.getRepository(Stage);
  const cardRepo = manager.getRepository(Card);

  if (options.reset) {
    await cardRepo.createQueryBuilder().delete().execute();
    await stageRepo.createQueryBuilder().delete().execute();
    await projectRepo.createQueryBuilder().delete().execute();
    await permissionRepo.createQueryBuilder().delete().execute();
    await teamRepo.createQueryBuilder().delete().execute();
    await userRepo.createQueryBuilder().delete().execute();
  }

  let users = await userRepo.find({ order: { name: 'ASC', lastName: 'ASC' } });
  if (users.length === 0) {
    users = await userRepo.save([
      userRepo.create({
        name: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        role: 'developer',
        competencies: ['typescript', 'react'],
        availability: 'available',
      }),
      userRepo.create({
        name: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        role: 'designer',
        competencies: ['figma', 'css'],
        availability: 'available',
      }),
      userRepo.create({
        name: 'Carol',
        lastName: 'Taylor',
        email: 'carol@example.com',
        role: 'product manager',
        competencies: ['planning', 'stakeholder management'],
        availability: 'partial',
      }),
    ]);
  }

  // alice = project creator (admin by ownership)
  // bob = collaborator via Core Team
  // carol = viewer via Viewer Team
  const [alice, bob, carol] = users;

  let coreTeam = await teamRepo.findOne({ where: { name: 'Core Team' } });
  if (!coreTeam) {
    coreTeam = await teamRepo.save(teamRepo.create({
      name: 'Core Team',
      members: [alice, bob],
    }));
  } else if ((coreTeam.members?.length ?? 0) === 0) {
    coreTeam.members = [alice, bob];
    coreTeam = await teamRepo.save(coreTeam);
  }

  let viewerTeam = await teamRepo.findOne({ where: { name: 'Viewer Team' } });
  if (!viewerTeam) {
    viewerTeam = await teamRepo.save(teamRepo.create({
      name: 'Viewer Team',
      members: [carol],
    }));
  }

  let project = await projectRepo.findOne({ where: { name: 'Alpha Project' } });
  if (!project) {
    project = await projectRepo.save(
      projectRepo.create({
        name: 'Alpha Project',
        teamId: coreTeam.id,
        createdById: alice.id,
      }),
    );
  } else if (!project.createdById) {
    project.createdById = alice.id;
    project = await projectRepo.save(project);
  }

  const existingPermissions = await permissionRepo.find({ where: { projectId: project.id } });
  if (existingPermissions.length === 0) {
    await permissionRepo.save([
      permissionRepo.create({
        projectId: project.id,
        teamId: coreTeam.id,
        permission: ProjectPermissionLevel.COLLABORATOR,
      }),
      permissionRepo.create({
        projectId: project.id,
        teamId: viewerTeam.id,
        permission: ProjectPermissionLevel.VIEWER,
      }),
    ]);
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
        assigneeId: alice.id,
        description: 'Initialize pnpm workspace.',
      }),
      cardRepo.create({
        summary: 'Design database schema',
        type: 'task',
        priority: 'high',
        order: 0,
        projectId: project.id,
        stageId: stageByName['In Progress'].id,
        assigneeId: bob.id,
        description: 'Define all entities and relationships.',
      }),
      cardRepo.create({
        summary: 'Build board UI',
        type: 'story',
        priority: 'high',
        order: 100,
        projectId: project.id,
        stageId: stageByName['In Progress'].id,
        assigneeId: alice.id,
        description: 'Implement the Kanban board with columns and cards.',
      }),
      cardRepo.create({
        summary: 'Add drag and drop',
        type: 'task',
        priority: 'medium',
        order: 0,
        projectId: project.id,
        stageId: stageByName['To Do'].id,
        assigneeId: alice.id,
        description: 'Integrate @hello-pangea/dnd into the board.',
      }),
      cardRepo.create({
        summary: 'Write API docs',
        type: 'task',
        priority: 'low',
        order: 0,
        projectId: project.id,
        stageId: stageByName.Review.id,
        assigneeId: carol.id,
        description: 'Ensure all endpoints have Swagger decorators.',
      }),
    ]);
  }

  return { users, coreTeam, viewerTeam, project, stages };
}
