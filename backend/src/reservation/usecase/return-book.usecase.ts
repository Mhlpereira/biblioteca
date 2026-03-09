import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { ReturnBookInput } from '../ports/in/return-book.in';
import { ReturnBookOutput } from '../ports/out/return-book-output';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { FINE_RULES } from '../../common/constants/fine.constants';


@Injectable()
export class ReturnBookUseCase {
  constructor(
    @Inject('ReservationOutPort')
    private readonly reservationRepository: ReservationOutPort,

    @Inject('BookCopyRepositoryOutPort')
    private readonly bookCopyRepository: BookCopyRepositoryOutPort,
  ) {}

  async execute(input: ReturnBookInput): Promise<ReturnBookOutput> {
    const reservation = await this.reservationRepository.findByIdWithBookCopy(input.id);

    if (!reservation) {
      throw new NotFoundException(`Reserva com ID ${input.id} não encontrada`);
    }

    if (reservation.status === ReservationStatus.RETURNED) {
      throw new BadRequestException('Livro já foi devolvido');
    }

    const now = new Date();
    reservation.returnedAt = now;
    reservation.status = ReservationStatus.RETURNED;

    const dueDate = new Date(reservation.dueDate);
    const diffTime = now.getTime() - dueDate.getTime();

    if (diffTime > 0) {
      reservation.daysLate = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      reservation.fineAmount = FINE_RULES.FIXED_FINE + reservation.daysLate * FINE_RULES.DAILY_PERCENT;
    }

    if (reservation.bookCopy) {
      await this.bookCopyRepository.updateStatus(reservation.bookCopy.id, BookCopyStatus.AVAILABLE);
    }

    const saved = await this.reservationRepository.save(reservation);

    return {
      id: saved.id,
      status: saved.status,
      returnedAt: saved.returnedAt,
      daysLate: saved.daysLate,
      fineAmount: saved.fineAmount,
    };
  }
}