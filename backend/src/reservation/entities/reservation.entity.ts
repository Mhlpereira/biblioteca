import { Entity, PrimaryColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BookCopy } from "../../book-copy/entities/book-copy.entity";
import { Client } from "../../client/entities/client.entity";
import { ReservationStatus } from "../enum/reservation-status.enum";

@Entity()
export class Reservation {
    @PrimaryColumn({ type: "char", length: 26 })
    id: string;

    @ManyToOne(() => Client)
    client: Client;

    @ManyToOne(() => BookCopy)
    bookCopy: BookCopy;

    @Column()
    reservedAt: Date;

    @Column()
    dueDate: Date;

    @Column({ nullable: true })
    returnedAt?: Date;

    @Column({
        type: "enum",
        enum: ReservationStatus,
        default: ReservationStatus.ACTIVE,
    })
    status: ReservationStatus;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    fineAmount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
