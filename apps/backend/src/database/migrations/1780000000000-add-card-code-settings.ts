import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCardCodeSettings1780000000000 implements MigrationInterface {
  name = 'AddCardCodeSettings1780000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "cardCodeEnabled" boolean NOT NULL DEFAULT true',
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "cardCodePattern" varchar NOT NULL DEFAULT '{PROJECT:4}-{NUMBER}'`,
    );
    await queryRunner.query(
      'ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "nextCardNumber" integer NOT NULL DEFAULT 1',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "projects" DROP COLUMN IF EXISTS "nextCardNumber"');
    await queryRunner.query('ALTER TABLE "projects" DROP COLUMN IF EXISTS "cardCodePattern"');
    await queryRunner.query('ALTER TABLE "projects" DROP COLUMN IF EXISTS "cardCodeEnabled"');
  }
}
