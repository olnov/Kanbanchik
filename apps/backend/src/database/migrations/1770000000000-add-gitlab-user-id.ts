import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGitlabUserId1770000000000 implements MigrationInterface {
  name = 'AddGitlabUserId1770000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gitlabUserId" varchar');
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_gitlabUserId" ON "users" ("gitlabUserId")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_gitlabUserId"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN IF EXISTS "gitlabUserId"');
  }
}
