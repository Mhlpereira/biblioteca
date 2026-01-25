import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { BookCopy } from "../../book-copy/entities/book-copy.entity";

@Entity()
export class Book {
    @PrimaryColumn({ type: "varchar", length: 26 })
    id: string;

    @Column()
    title: string;

    @Column()
    author: string;

    @OneToMany(() => BookCopy, copy => copy.book)
    copies: BookCopy[];

    @Column({default: true})
    active: boolean;

    @Column({nullable: true})
    imageUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
