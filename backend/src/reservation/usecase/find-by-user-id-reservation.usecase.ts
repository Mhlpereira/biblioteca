import { Inject, NotFoundException } from "@nestjs/common";
import { ReservationOutPort } from "../ports/reservation-out.port";
import { PaginatedResult } from "../../common/interfaces/paginated.interface";
import { FindByUserIdOutput } from "../ports/out/find-by-user-id-output";
import { ReservationStatus } from "../enum/reservation-status.enum";
import { FINE_RULES } from "../../common/constants/fine.constants";



export class FindByUserIdReservationUseCase {
    constructor(
        @Inject("ReservationOutPort")
        private readonly reservationRepository: ReservationOutPort
    ) {}

    async execute(keycloackClientId: string): Promise<PaginatedResult<FindByUserIdOutput>> {
        const reservations = await this.reservationRepository.findByUserId(keycloackClientId);

        if(!reservations || reservations.data.length === 0) {
            throw new NotFoundException("Nenhuma reserva encontrada para o usuário");
        }

        const now = new Date();

        const data: FindByUserIdOutput[] = reservations.data.map(r => {
            const dueDate = new Date(r.dueDate);
            const isOverdue = r.status !== ReservationStatus.RETURNED && dueDate < now;
            const diffTime = now.getTime() - dueDate.getTime();
            const daysLate = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            const potentialFine = isOverdue ? FINE_RULES.FIXED_FINE + daysLate * FINE_RULES.DAILY_PERCENT : null;

            return {
                id: r.id,
                bookTitle: r.bookCopy?.book?.title,
                bookImage: r.bookCopy?.book?.imageUrl || null,
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
            meta: reservations.meta,
        };
    }
}