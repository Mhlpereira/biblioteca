import { Inject, NotFoundException } from "@nestjs/common";
import { ReservationOutPort } from "../ports/reservation-out.port";
import { FindByIdReservationOutput } from "../ports/out/find-by-id-reservation-output";


export class FindByIdReservationUseCase {
    constructor(
        @Inject('ReservationOutPort')
        private readonly repository: ReservationOutPort,
    ) {}
    
    async execute(id: string): Promise<FindByIdReservationOutput> {
        const reservation = await this.repository.findByIdWithBookCopy(id);

        if(!reservation) {
            throw new NotFoundException("Reserva não encontrada");
        }

        return {
            id: reservation.id,
            keycloackClientId: reservation.keycloackClientId,
            bookCopyId: reservation.bookCopy?.id,
            bookTitle: reservation.bookCopy?.book?.title,
            bookImage: reservation.bookCopy?.book?.imageUrl || null,
            reservedAt: reservation.reservedAt,
            dueDate: reservation.dueDate,
            returnedAt: reservation.returnedAt || null,
            status: reservation.status,
            daysLate: reservation.daysLate,
            fineAmount: reservation.fineAmount,
        };
    }
}