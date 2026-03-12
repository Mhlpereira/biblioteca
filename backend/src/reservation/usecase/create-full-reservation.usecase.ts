import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ulid } from 'ulid';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { CreateFullReservationInput } from '../ports/in/create-full-reservation.in';
import { ReservationDetailOutput } from '../ports/out/reservation-detail-output';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopy } from '../../book-copy/entities/book-copy.entity';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { ReservationEventProducer } from '../../infra/database/kafka/producer/reservation-event.producer';


@Injectable()
export class CreateFullReservationUseCase {
  constructor(
    @Inject('ReservationOutPort')
    private readonly reservationRepository: ReservationOutPort,

    @Inject('BookCopyRepositoryOutPort')
    private readonly bookCopyRepository: BookCopyRepositoryOutPort,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly reservationEventProducer: ReservationEventProducer,
  ) {}

  async execute(input: CreateFullReservationInput): Promise<ReservationDetailOutput> {
    const bookCopy = await this.bookCopyRepository.findAvailableByBookId(input.bookCopyId);

    if (!bookCopy) {
      throw new NotFoundException('Cópia do livro não encontrada');
    }

    const reservation = this.reservationRepository.create({
      id: ulid(),
      keycloackClientId: input.keycloackClientId,
      bookCopy,
      reservedAt: input.reservedAt ? new Date(input.reservedAt) : new Date(),
      dueDate: new Date(input.dueDate),
      returnedAt: input.returnedAt ? new Date(input.returnedAt) : undefined,
      status: (input.status as ReservationStatus) || ReservationStatus.ACTIVE,
      daysLate: input.daysLate || 0,
      fineAmount: input.fineAmount || 0,
    });

    await this.dataSource.transaction(async manager => {
      await manager.save(reservation);
      const newCopyStatus =
        (input.status as ReservationStatus) === ReservationStatus.RETURNED
          ? BookCopyStatus.AVAILABLE
          : BookCopyStatus.RESERVED;

      await manager.update(BookCopy, bookCopy.id, { status: newCopyStatus });
    });

    const saved = await reservation;
    await this.reservationEventProducer.emitReservationEvent(saved, 'created');

    return {
      id: saved.id,
      keycloackClientId: input.keycloackClientId,
      bookCopyId: bookCopy.id,
      reservedAt: saved.reservedAt,
      dueDate: saved.dueDate,
      returnedAt: saved.returnedAt,
      status: saved.status,
      daysLate: saved.daysLate,
      fineAmount: saved.fineAmount,
    };
  }
}