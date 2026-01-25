import { MigrationInterface, QueryRunner } from "typeorm";

export class ModelagemInicial1769321163119 implements MigrationInterface {
    name = 'ModelagemInicial1769321163119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book\` ADD \`image_url\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`client\` ADD \`active\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`client\` ADD \`role\` varchar(255) NOT NULL DEFAULT 'USER'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`client\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`client\` DROP COLUMN \`active\``);
        await queryRunner.query(`ALTER TABLE \`book\` DROP COLUMN \`image_url\``);
    }

}
