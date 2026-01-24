import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";
import { DataSource, Repository } from "typeorm";
import { ClientService } from "../client/client.service";
import { BookCopyService } from "../book-copy/book-copy.service";
import { CreateReservation } from "./interface/create-reservation.interface";
import { ulid } from "ulid";
import { ReservationStatus } from "./enum/reservation-status.enum";
import { BookCopy } from "../book-copy/entities/book-copy.entity";
import { BookCopyStatus } from "../book-copy/enum/book-status.enum";
import { FindReservation } from "./interface/find-reservation.interface";
import { PaginatedResult } from "../common/interfaces/paginated.interface";
import { ReservationListResponse } from "./interface/reservation-list-response.interface";
import { FINE_RULES } from "../common/constants/fine.constants";

@Injectable()
export class ReservationService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservatioRepository: Repository<Reservation>,
        private readonly clientService: ClientService,
        private readonly bookCopyService: BookCopyService,
        @InjectDataSource()
        private dataSource: DataSource
    ) {}

    async create(createReservation: CreateReservation) {
        const client = await this.clientService.findByIdorThrow(createReservation.clientId);
        const bookCopy = await this.bookCopyService.findAvailableCopyByBookId(createReservation.bookId);

        const reservation = this.reservatioRepository.create({
            id: ulid(),
            client,
            bookCopy,
            reservedAt: Date.now(),
            dueDate: createReservation.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: ReservationStatus.ACTIVE,
        });

        await this.dataSource.transaction(async manager => {
            await manager.save(reservation);

            await manager.update(BookCopy, bookCopy.id, {
                status: BookCopyStatus.RESERVED,
            });
        });

        return reservation;
    }

    async findAll(findReservation: FindReservation): Promise<PaginatedResult<ReservationListResponse>> {
        const page = findReservation.page || 1;
        const limit = findReservation.limit || 10;
        const skip = (page - 1) * limit;

        const qb = this.reservatioRepository
            .createQueryBuilder("reservation")
            .leftJoin("reservation.client", "client")
            .leftJoin("reservation.bookCopy", "bookCopy")
            .leftJoin("bookCopy.book", "book")
            .select([
                "reservation.id AS id",
                "client.name AS clientName",
                "book.title AS bookTitle",
                "reservation.reservedAt AS reservedAt",
                "reservation.dueDate AS dueDate",
                "reservation.returnedAt AS returnedAt",
                "reservation.status AS status",
            ]);

        if (findReservation.clientId) {
            qb.andWhere("client.id = :clientId", { clientId: findReservation.clientId });
        }

        if (findReservation.bookId) {
            qb.andWhere("book.id = :bookId", { bookId: findReservation.bookId });
        }

        if (findReservation.reservedAt) {
            qb.andWhere("reservation.reservedAt >= :reservedAt", { reservedAt: new Date(findReservation.reservedAt) });
        }

        if (findReservation.dueDate) {
            qb.andWhere("reservation.dueDate <= :dueDate", { dueDate: new Date(findReservation.dueDate) });
        }

        if (findReservation.returnedAt) {
            qb.andWhere("reservation.returnedAt <= :returnedAt", { returnedAt: new Date(findReservation.returnedAt) });
        }

        if (findReservation.status) {
            qb.andWhere("reservation.status = :status", { status: findReservation.status });
        }

        const countQb = qb.clone().select("COUNT(*)", "total").getRawOne();
        const total = (await countQb).total;

        qb.take(limit).skip(skip);

        const raw = await qb.getRawMany();

        const data = raw.map(r => ({
            id: r.id,
            clientName: r.clientname,
            bookTitle: r.booktitle,
            reservedAt: r.reservedat,
            dueDate: r.duedate,
            returnedAt: r.returnedat,
            status: r.status,
        }));

        const lastPage = Math.ceil(total / limit);

        return {
            data,
            meta: {
                total,
                page,
                lastPage,
            },
        };
    }

    async findAuthClientReservation(id: string): Promise<PaginatedResult<ReservationListResponse>> {
        const reservations = await this.findAll({ clientId: id });
        return reservations;
    }

    async findOne(id: string): Promise<Reservation> {
        const reservation = await this.reservatioRepository.findOneBy({ id });
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }
        return reservation;
    }

    async update(id: string, updateReservationDto: UpdateReservationDto) {
        const reservation = await this.reservatioRepository.findOneBy({ id });
        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        if (updateReservationDto.status !== undefined) {
            reservation.status = updateReservationDto.status;
        }
        if (updateReservationDto.returnedAt !== undefined) {
            reservation.returnedAt = updateReservationDto.returnedAt;
        }
        if (updateReservationDto.daysLate !== undefined) {
            reservation.daysLate = updateReservationDto.daysLate;
        }
        if (updateReservationDto.fineAmount !== undefined) {
            reservation.fineAmount = updateReservationDto.fineAmount;
        }

        if (reservation.status === ReservationStatus.RETURNED && reservation.bookCopy) {
            await this.bookCopyService.updateStatus(reservation.bookCopy.id, BookCopyStatus.AVAILABLE);
        }

        return await this.reservatioRepository.save(reservation);
    }

    async returnBook(id: string): Promise<Reservation> {
        const reservation = await this.reservatioRepository.findOne({
            where: { id },
            relations: ["bookCopy"],
        });
        if (!reservation) {
            throw new NotFoundException(`Reserva com ID ${id} não encontrada`);
        }
        if (reservation.status === ReservationStatus.RETURNED) {
            throw new BadRequestException("Livro já foi devolvido");
        }

        const now = new Date();
        reservation.returnedAt = now;
        reservation.status = ReservationStatus.RETURNED;
        const dueDate = new Date(reservation.dueDate);
        const diffTime = now.getTime() - dueDate.getTime();

        if (diffTime > 0) {
            this.calculateFine(reservation, diffTime);
        }

        if (reservation.bookCopy) {
            await this.bookCopyService.updateStatus(reservation.bookCopy.id, BookCopyStatus.AVAILABLE);
        }

        return await this.reservatioRepository.save(reservation);
    }

    private calculateFine(reservation: Reservation, diffTime: number) {
        reservation.daysLate = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        reservation.fineAmount = FINE_RULES.FIXED_FINE + reservation.daysLate * FINE_RULES.DAILY_PERCENT;
    }

    async remove(id: string): Promise<void> {
        const reservation = await this.reservatioRepository.findOneBy({ id });
        if (!reservation) {
            throw new NotFoundException(`Reserva com ID ${id} não encontrade`);
        }
        await this.reservatioRepository.remove(reservation);
    }
}
