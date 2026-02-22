import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../../auth/enum/role.enum";


@Entity()
export class Client{

    @PrimaryColumn({ type: 'varchar', length: 26 })
    id: string;

    @Column({unique: true})
    keycloakId: string;

    @Column({unique:true})
    email: string;

    @Column({unique:true})
    cpf: string;

    @Column()
    name: string;

    @Column()
    lastName: string;

    @Column({default: true})
    active: boolean;

    @Column({type: 'varchar', default: Role.USER})
    role: Role;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}