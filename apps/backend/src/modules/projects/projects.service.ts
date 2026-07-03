import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Project } from './project.entity';
import { ProjectMember, ProjectPermissionLevel } from './project-member.entity';
import { ProjectShareLink } from './project-share-link.entity';
import { ProjectInvite } from './project-invite.entity';
import { Stage } from '../stages/stage.entity';
import { Card } from '../cards/card.entity';
import { User } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { SaveShareLinkDto } from './dto/save-share-link.dto';
import { DEFAULT_PROJECT_STAGES } from '../../database/project-defaults';
import { PermissionService } from '../permissions/permission.service';
import { generateToken } from '../../common/token';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
    @InjectRepository(ProjectMember) private readonly memberRepo: Repository<ProjectMember>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(ProjectShareLink)
    private readonly shareLinkRepo: Repository<ProjectShareLink>,
    @InjectRepository(ProjectInvite) private readonly inviteRepo: Repository<ProjectInvite>,
    private readonly permissionService: PermissionService,
  ) {}

  async findAll(userId: string): Promise<Project[]> {
    const accessibleIds = await this.permissionService.getAccessibleProjectIds(userId);
    if (accessibleIds.length === 0) return [];
    return this.projectRepo.findBy({ id: In(accessibleIds) });
  }

  findOne(id: string): Promise<Project> {
    return this.projectRepo.findOneByOrFail({ id });
  }

  async create(dto: CreateProjectDto, createdById: string): Promise<Project> {
    return this.projectRepo.manager.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const stageRepo = manager.getRepository(Stage);

      const project = await projectRepo.save(
        projectRepo.create({ name: dto.name.trim(), createdById }),
      );

      await stageRepo.save(
        DEFAULT_PROJECT_STAGES.map((stage) =>
          stageRepo.create({ ...stage, projectId: project.id }),
        ),
      );

      return projectRepo.findOneByOrFail({ id: project.id });
    });
  }

  async remove(id: string): Promise<void> {
    await this.projectRepo.manager.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const memberRepo = manager.getRepository(ProjectMember);
      const stageRepo = manager.getRepository(Stage);
      const cardRepo = manager.getRepository(Card);

      await projectRepo.findOneByOrFail({ id });
      await memberRepo.createQueryBuilder().delete().where('"projectId" = :id', { id }).execute();
      await cardRepo.softDelete({ projectId: id });
      await stageRepo.softDelete({ projectId: id });
      await projectRepo.softDelete(id);
    });
  }

  async getBoard(projectId: string, userId: string) {
    const [project, stages, cards, myPermission] = await Promise.all([
      this.projectRepo.findOneByOrFail({ id: projectId }),
      this.stageRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
      this.cardRepo.find({ where: { projectId }, order: { order: 'ASC' } }),
      this.permissionService.getUserProjectPermission(userId, projectId),
    ]);
    return { project, stages, cards, myPermission };
  }

  async getMembers(projectId: string, currentUserId: string) {
    const [members, myPermission] = await Promise.all([
      this.memberRepo.find({ where: { projectId } }),
      this.permissionService.getUserProjectPermission(currentUserId, projectId),
    ]);
    return { members, myPermission };
  }

  async getAssignableUsers(projectId: string): Promise<User[]> {
    // Viewers can read the board but cannot be assigned cards, so exclude them.
    // The project owner is always an admin and is added separately below.
    const [project, members] = await Promise.all([
      this.projectRepo.findOneByOrFail({ id: projectId }),
      this.memberRepo.find({
        where: { projectId, role: Not(ProjectPermissionLevel.VIEWER) },
      }),
    ]);

    const usersById = new Map<string, User>();
    for (const member of members) {
      if (member.user) usersById.set(member.user.id, member.user);
    }
    if (project.createdById) {
      const owner = await this.userRepo.findOneBy({ id: project.createdById });
      if (owner) usersById.set(owner.id, owner);
    }
    return [...usersById.values()];
  }

  async addMember(projectId: string, dto: AddProjectMemberDto): Promise<ProjectMember> {
    const project = await this.projectRepo.findOneByOrFail({ id: projectId });
    if (project.createdById === dto.userId) {
      throw new BadRequestException('Project creator is always admin — no member row needed');
    }

    const existing = await this.memberRepo.findOne({ where: { projectId, userId: dto.userId } });
    if (existing) throw new ConflictException('User is already a member of this project');

    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user) throw new NotFoundException(`User ${dto.userId} not found`);

    return this.memberRepo.save(
      this.memberRepo.create({
        projectId,
        userId: dto.userId,
        role: dto.role ?? ProjectPermissionLevel.VIEWER,
      }),
    );
  }

  async updateMemberRole(
    projectId: string,
    userId: string,
    dto: UpdateProjectMemberRoleDto,
  ): Promise<ProjectMember> {
    const project = await this.projectRepo.findOneByOrFail({ id: projectId });
    if (project.createdById === userId) {
      throw new BadRequestException('Cannot change the role of the project creator');
    }
    const member = await this.memberRepo.findOneOrFail({ where: { projectId, userId } });
    member.role = dto.role;
    return this.memberRepo.save(member);
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepo.findOneByOrFail({ id: projectId });
    if (project.createdById === userId) {
      throw new BadRequestException('Cannot remove the project creator');
    }
    await this.memberRepo.delete({ projectId, userId });
  }

  async createInvite(
    projectId: string,
    dto: CreateInviteDto,
    invitedById: string,
  ): Promise<ProjectInvite> {
    await this.projectRepo.findOneByOrFail({ id: projectId });
    const email = dto.email.trim().toLowerCase();

    const existingInvite = await this.inviteRepo.findOne({ where: { projectId, email } });
    if (existingInvite) throw new ConflictException('This email has already been invited');

    const existingUser = await this.userRepo.findOneBy({ email });
    if (existingUser) {
      const project = await this.projectRepo.findOneByOrFail({ id: projectId });
      const member = await this.memberRepo.findOne({
        where: { projectId, userId: existingUser.id },
      });
      if (member || project.createdById === existingUser.id) {
        throw new ConflictException('This user is already a member of the project');
      }
    }

    return this.inviteRepo.save(
      this.inviteRepo.create({
        projectId,
        email,
        role: dto.role ?? ProjectPermissionLevel.VIEWER,
        token: generateToken(),
        invitedById,
      }),
    );
  }

  getInvites(projectId: string): Promise<ProjectInvite[]> {
    return this.inviteRepo.find({ where: { projectId }, order: { createdAt: 'ASC' } });
  }

  async revokeInvite(projectId: string, inviteId: string): Promise<void> {
    await this.inviteRepo.delete({ id: inviteId, projectId });
  }
}
