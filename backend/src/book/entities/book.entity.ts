import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Book {
    @PrimaryColumn({ type: "char", length: 26 })
    id: string;

    @Column()
    title: string;

    @Column()
    author: string;

    @Column({ default: 0 })
    totalCopies: number;

    @Column()
    availableCopies: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
