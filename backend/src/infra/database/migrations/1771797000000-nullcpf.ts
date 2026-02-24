import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCpfNullable1771797000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`client\` CHANGE \`cpf\` \`cpf\` varchar(255) NULL DEFAULT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`client\` CHANGE \`cpf\` \`cpf\` varchar(255) NOT NULL`
        );
    }
}