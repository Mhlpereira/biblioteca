import { Inject, Injectable } from '@nestjs/common';
import { FindReservationInput } from '../ports/in/find-reservation.in';
import { PaginatedResult } from '../../common/interfaces/paginated.interface';
import { ReservationListOutput } from '../ports/out/reservation-list-output';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { FINE_RULES } from '../../common/constants/fine.constants';


@Injectable()
export class FindAllReservationsUseCase {
  constructor(
    @Inject('ReservationOutPort')
    private readonly reservationRepository: ReservationOutPort,
  ) {}

  async execute(input: FindReservationInput): Promise<PaginatedResult<ReservationListOutput>> {
    const page = input.page || 1;
    const limit = input.limit || 10;

    const result = await this.reservationRepository.findAll({
      page,
      limit,
      clientId: input.clientId,
      bookId: input.bookId,
      reservedAt: input.reservedAt,
      dueDate: input.dueDate,
      returnedAt: input.returnedAt,
      status: input.status,
      overdueOnly: input.overdueOnly,
    });

    const now = new Date();

    const data: ReservationListOutput[] = result.data.map(r => {
      const dueDate = new Date(r.dueDate);
      const isOverdue = r.status !== ReservationStatus.RETURNED && dueDate < now;
      const diffTime = now.getTime() - dueDate.getTime();
      const daysLate = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const potentialFine = isOverdue ? FINE_RULES.FIXED_FINE + daysLate * FINE_RULES.DAILY_PERCENT : 0;

      return {
        id: r.id,
        clientName: r.keycloackClientId,
        bookTitle: r.bookCopy?.book?.title,
        bookImage: r.bookCopy?.book?.imageUrl || null,
        author: r.bookCopy?.book?.author,
        reservedAt: r.reservedAt,
        dueDate: r.dueDate,
        returnedAt: r.returnedAt || null,
        status: r.status,
        fineAmount: r.fineAmount ?? null,
        isOverdue,
        potentialFine,
      };
    });

    return {
      data,
      meta: result.meta,
    };
  }
}