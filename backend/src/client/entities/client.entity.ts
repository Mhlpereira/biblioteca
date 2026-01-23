import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class Client{

    @PrimaryColumn({ type: 'char', length: 26 })
    id: string;

    @Column({unique:true, length: 11})
    cpf: string;

    @Column()
    name: string;

    @Column()
    lastName: string;

    @Column({select: false})
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}