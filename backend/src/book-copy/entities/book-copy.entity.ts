import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Book } from "../../book/entities/book.entity";
import { BookCopyStatus } from "../enum/book-status.enum";

@Entity()
export class BookCopy {
    @PrimaryColumn({ type: "char", length: 26 })
    id: string;

    @ManyToOne(() => Book)
    book: Book;

    @Column({
        type: "enum",
        enum: BookCopyStatus,
        default: BookCopyStatus.AVAILABLE,
    })
    status: BookCopyStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
