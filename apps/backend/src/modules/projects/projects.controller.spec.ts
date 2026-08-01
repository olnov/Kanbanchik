import { PROJECT_PERMISSION_KEY } from '../../common/decorators/project-permission.decorator';
import { ProjectPermissionLevel } from './project-member.entity';
import { ProjectsController } from './projects.controller';

describe('ProjectsController card-code backfill', () => {
  it('delegates the project id to the service', async () => {
    const service = {
      backfillCardCodes: jest.fn().mockResolvedValue({ updatedCount: 2, nextCardNumber: 9 }),
    };
    const controller = new ProjectsController(service as never);

    await expect(controller.backfillCardCodes('proj-1')).resolves.toEqual({
      updatedCount: 2,
      nextCardNumber: 9,
    });
    expect(service.backfillCardCodes).toHaveBeenCalledWith('proj-1');
  });

  it('requires admin permission from the project route parameter', () => {
    const requirement = Reflect.getMetadata(
      PROJECT_PERMISSION_KEY,
      ProjectsController.prototype.backfillCardCodes,
    );

    expect(requirement).toEqual({
      level: ProjectPermissionLevel.ADMIN,
      source: 'project-param:id',
    });
  });
});
