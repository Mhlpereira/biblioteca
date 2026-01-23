import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";
import { DataSource, Repository } from "typeorm";
import { ClientService } from "../client/client.service";
import { BookCopyService } from "../book-copy/book-copy.service";
import { CreateReservation } from "./interface/create-reservation.interface";
import { ulid } from "ulid";
import { ReservationStatus } from "./enum/reservation-status.enum";
import { BookCopy } from "../book-copy/entities/book-copy.entity";
import { BookCopyStatus } from "../book-copy/enum/book-status.enum";

@Injectable()
export class ReservationService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservatioRepository: Repository<Reservation>,
        private readonly clientService: ClientService,
        private readonly bookCopyService: BookCopyService,
        private dataSource: DataSource,
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
          status: ReservationStatus.ACTIVE
        });

        await this.dataSource.transaction(async(manager)=>{
          await manager.save(reservation);

          await manager.update(BookCopy, bookCopy.id,{
            status: BookCopyStatus.RESERVED
          });
        });

        return reservation;
    }

    async findAll() {
        return `This action returns all reservation`;
    }

    findOne(id: number) {
        return `This action returns a #${id} reservation`;
    }

    update(id: number, updateReservationDto: UpdateReservationDto) {
        return `This action updates a #${id} reservation`;
    }

    remove(id: number) {
        return `This action removes a #${id} reservation`;
    }
}
