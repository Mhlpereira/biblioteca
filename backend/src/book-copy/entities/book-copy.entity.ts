import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Book } from "../../book/entities/book.entity";
import { BookCopyStatus } from "../enum/book-status.enum";

@Index(["book" , "status"])
@Entity()
export class BookCopy {
    @PrimaryColumn({ type: "varchar", length: 26 })
    id: string;

    @ManyToOne(() => Book)
    book: Book;

    @Column({
        type: "varchar",
        enum: BookCopyStatus,
        default: BookCopyStatus.AVAILABLE,
    })
    status: BookCopyStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
