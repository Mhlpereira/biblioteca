import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ulid } from 'ulid';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { CreateReservationInput } from '../ports/in/create-reservation.in';
import { ReservationDetailOutput } from '../ports/out/reservation-detail-output';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopy } from '../../book-copy/entities/book-copy.entity';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';


@Injectable()
export class CreateReservationUseCase {
  constructor(
    @Inject('ReservationOutPort')
    private readonly reservationRepository: ReservationOutPort,

    @Inject('BookCopyRepositoryOutPort')
    private readonly bookCopyRepository: BookCopyRepositoryOutPort,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: any,
  ) {}

  async execute(input: CreateReservationInput): Promise<ReservationDetailOutput> {
    const bookCopy = await this.bookCopyRepository.findAvailableByBookId(input.bookId);

    if (!bookCopy) {
      throw new NotFoundException('Nenhuma cópia disponível para este livro');
    }

    const reservation = await this.reservationRepository.create({
      id: ulid(),
      keycloackClientId: input.keycloackClientId,
      bookCopy,
      reservedAt: new Date(),
      dueDate: input.dueDate
        ? new Date(input.dueDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: ReservationStatus.ACTIVE,
    });

    await this.dataSource.transaction(async manager => {
      await manager.save(reservation);
      await manager.update(BookCopy, bookCopy.id, {
        status: BookCopyStatus.RESERVED,
      });
    });

    this.kafkaClient.emit('reservation.created', {
      id: reservation.id,
      keycloackClientId: input.keycloackClientId,
      reservedAt: reservation.reservedAt,
      dueDate: reservation.dueDate,
    });

    return {
      id: reservation.id,
      keycloackClientId: input.keycloackClientId,
      bookCopyId: bookCopy.id,
      reservedAt: reservation.reservedAt,
      dueDate: reservation.dueDate,
      status: reservation.status,
      daysLate: reservation.daysLate,
      fineAmount: reservation.fineAmount,
    };
  }
}