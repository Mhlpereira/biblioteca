import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { UpdateReservationInput } from '../ports/in/update-reservation.in';
import { ReservationDetailOutput } from '../ports/out/reservation-detail-output';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { ReservationEventProducer } from '../../infra/database/kafka/producer/reservation-event.producer';


@Injectable()
export class UpdateReservationUseCase {
  constructor(
    @Inject('ReservationOutPort')
    private readonly reservationRepository: ReservationOutPort,

    @Inject('BookCopyRepositoryOutPort')
    private readonly bookCopyRepository: BookCopyRepositoryOutPort,

    private readonly reservationEventProducer: ReservationEventProducer,
  ) {}

  async execute(input: UpdateReservationInput): Promise<ReservationDetailOutput> {
    const reservation = await this.reservationRepository.findByIdWithBookCopy(input.id);

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${input.id} not found`);
    }

    if (input.status !== undefined) reservation.status = input.status as ReservationStatus;
    if (input.returnedAt !== undefined) reservation.returnedAt = input.returnedAt;
    if (input.daysLate !== undefined) reservation.daysLate = input.daysLate;
    if (input.fineAmount !== undefined) reservation.fineAmount = input.fineAmount;

    if (reservation.status === ReservationStatus.RETURNED && reservation.bookCopy) {
      await this.bookCopyRepository.updateStatus(reservation.bookCopy.id, BookCopyStatus.AVAILABLE);
    }

    const saved = await this.reservationRepository.save(reservation);

    const action = saved.status === ReservationStatus.RETURNED ? 'returned' : 'updated';
    await this.reservationEventProducer.emitReservationEvent(saved, action);

    return {
      id: saved.id,
      keycloackClientId: saved.keycloackClientId,
      bookCopyId: saved.bookCopy?.id,
      reservedAt: saved.reservedAt,
      dueDate: saved.dueDate,
      returnedAt: saved.returnedAt,
      status: saved.status,
      daysLate: saved.daysLate,
      fineAmount: saved.fineAmount,
    };
  }
}