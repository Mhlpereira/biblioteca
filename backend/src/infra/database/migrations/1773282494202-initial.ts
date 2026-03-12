import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1773282494202 implements MigrationInterface {
    name = 'Initial1773282494202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`book\` (\`id\` varchar(26) NOT NULL, \`title\` varchar(255) NOT NULL, \`author\` varchar(255) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`image_url\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book_copy\` (\`id\` varchar(26) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'AVAILABLE', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`book_id\` varchar(26) NULL, INDEX \`IDX_420357a5e62ccb526db9e310ea\` (\`book_id\`, \`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reservation\` (\`id\` varchar(26) NOT NULL, \`keycloack_client_id\` varchar(255) NOT NULL, \`reserved_at\` datetime NOT NULL, \`due_date\` datetime NOT NULL, \`returned_at\` datetime NULL, \`status\` varchar(255) NOT NULL DEFAULT 'ACTIVE', \`days_late\` int NULL, \`fine_amount\` decimal(10,2) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`book_copy_id\` varchar(26) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`book_copy\` ADD CONSTRAINT \`FK_a3365d29e50bf551ff93777d4cb\` FOREIGN KEY (\`book_id\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reservation\` ADD CONSTRAINT \`FK_b96c0014bf9785187cea8f550dc\` FOREIGN KEY (\`book_copy_id\`) REFERENCES \`book_copy\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reservation\` DROP FOREIGN KEY \`FK_b96c0014bf9785187cea8f550dc\``);
        await queryRunner.query(`ALTER TABLE \`book_copy\` DROP FOREIGN KEY \`FK_a3365d29e50bf551ff93777d4cb\``);
        await queryRunner.query(`DROP TABLE \`reservation\``);
        await queryRunner.query(`DROP INDEX \`IDX_420357a5e62ccb526db9e310ea\` ON \`book_copy\``);
        await queryRunner.query(`DROP TABLE \`book_copy\``);
        await queryRunner.query(`DROP TABLE \`book\``);
    }

}
