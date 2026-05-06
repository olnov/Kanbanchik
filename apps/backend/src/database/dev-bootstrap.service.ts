import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Project } from '../modules/projects/project.entity';
import { seedDemoWorkspace } from './demo-data';

@Injectable()
export class DevBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DevBootstrapService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    const shouldAutoSeed =
      process.env.NODE_ENV === 'development' &&
      process.env.AUTO_SEED_DEMO !== 'false';

    if (!shouldAutoSeed) {
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      const [userCount, projectCount] = await Promise.all([
        manager.getRepository(User).count(),
        manager.getRepository(Project).count(),
      ]);

      if (userCount > 0 && projectCount > 0) {
        return;
      }

      await seedDemoWorkspace(manager);
      this.logger.log(
        `Seeded demo workspace because database was incomplete (users=${userCount}, projects=${projectCount})`,
      );
    });
  }
}
