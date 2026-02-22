import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1771736940653 implements MigrationInterface {
    name = 'Initial1771736940653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`client\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`client\` ADD \`keycloak_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`client\` ADD UNIQUE INDEX \`IDX_4c536310988231f1d6de6ee95f\` (\`keycloak_id\`)`);
        await queryRunner.query(`ALTER TABLE \`client\` ADD \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`client\` ADD UNIQUE INDEX \`IDX_6436cc6b79593760b9ef921ef1\` (\`email\`)`);
        await queryRunner.query(`DROP INDEX \`IDX_9921dca81551c93e5a459ef03c\` ON \`client\``);
        await queryRunner.query(`ALTER TABLE \`client\` DROP COLUMN \`cpf\``);
        await queryRunner.query(`ALTER TABLE \`client\` ADD \`cpf\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`client\` ADD UNIQUE INDEX \`IDX_9921dca81551c93e5a459ef03c\` (\`cpf\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`client\` DROP INDEX \`IDX_9921dca81551c93e5a459ef03c\``);
        await queryRunner.query(`ALTER TABLE \`client\` DROP COLUMN \`cpf\``);
        await queryRunner.query(`ALTER TABLE \`client\` ADD \`cpf\` varchar(11) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_9921dca81551c93e5a459ef03c\` ON \`client\` (\`cpf\`)`);
        await queryRunner.query(`ALTER TABLE \`client\` DROP INDEX \`IDX_6436cc6b79593760b9ef921ef1\``);
        await queryRunner.query(`ALTER TABLE \`client\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`client\` DROP INDEX \`IDX_4c536310988231f1d6de6ee95f\``);
        await queryRunner.query(`ALTER TABLE \`client\` DROP COLUMN \`keycloak_id\``);
        await queryRunner.query(`ALTER TABLE \`client\` ADD \`password\` varchar(255) NOT NULL`);
    }

}
