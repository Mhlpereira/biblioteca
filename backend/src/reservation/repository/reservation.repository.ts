import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginatedResult } from "../../common/interfaces/paginated.interface";
import { Reservation } from "../entities/reservation.entity";
import { ReservationStatus } from "../enum/reservation-status.enum";
import { ReservationOutPort } from "../ports/reservation-out.port";
import { ReservationFilters } from "../ports/in/reservation-filters.in";

@Injectable()
export class ReservationRepository implements ReservationOutPort {
    constructor(
        @InjectRepository(Reservation)
        private readonly repository: Repository<Reservation>
    ) {}

    async create(data: Partial<Reservation>): Promise<Reservation> {
        const reservation = this.repository.create(data);
        return this.repository.save(reservation);
    }

    async findById(id: string): Promise<Reservation | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByUserId(id: string): Promise<PaginatedResult<Reservation>> {
        const reservations = await this.repository.find({
            where: { keycloackClientId: id },
            relations: ["bookCopy", "bookCopy.book"]
        });

        return {
            data: reservations,
            meta: {
                total: reservations.length,
                page: 1,
                lastPage: 1
            }
        };
    }

    async findByIdWithBookCopy(id: string): Promise<Reservation | null> {
        return this.repository.findOne({
            where: { id },
            relations: ["bookCopy", "bookCopy.book"],
        });
    }

    async save(reservation: Reservation): Promise<Reservation> {
        return this.repository.save(reservation);
    }

    async remove(reservation: Reservation): Promise<void> {
        await this.repository.remove(reservation);
    }

    async findAll(filters: ReservationFilters): Promise<PaginatedResult<Reservation>> {
        const { page, limit } = filters;
        const skip = (page - 1) * limit;

        const qb = this.repository
            .createQueryBuilder("reservation")
            .leftJoinAndSelect("reservation.bookCopy", "bookCopy")
            .leftJoinAndSelect("bookCopy.book", "book");

        if (filters.clientId) {
            qb.andWhere("reservation.keycloackClientId = :clientId", { clientId: filters.clientId });
        }

        if (filters.bookId) {
            qb.andWhere("book.id = :bookId", { bookId: filters.bookId });
        }

        if (filters.reservedAt) {
            qb.andWhere("reservation.reservedAt >= :reservedAt", {
                reservedAt: new Date(filters.reservedAt),
            });
        }

        if (filters.dueDate) {
            qb.andWhere("reservation.dueDate <= :dueDate", {
                dueDate: new Date(filters.dueDate),
            });
        }

        if (filters.returnedAt) {
            qb.andWhere("reservation.returnedAt <= :returnedAt", {
                returnedAt: new Date(filters.returnedAt),
            });
        }

        if (filters.status) {
            qb.andWhere("reservation.status = :status", { status: filters.status });
        }

        if (filters.overdueOnly) {
            qb.andWhere("reservation.dueDate < :now", { now: new Date() });
            qb.andWhere("reservation.status != :returned", { returned: ReservationStatus.RETURNED });
        }

        qb.orderBy("CASE WHEN reservation.dueDate < :now AND reservation.status != :returned THEN 0 ELSE 1 END", "ASC")
            .addOrderBy("reservation.dueDate", "ASC")
            .setParameter("now", new Date())
            .setParameter("returned", ReservationStatus.RETURNED);

        const total = await qb.getCount();
        const data = await qb.skip(skip).take(limit).getMany();

        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
}
