import { Inject, Logger } from "@nestjs/common";
import { ReservationOutPort } from "../ports/reservation-out.port";
import { PaginatedResult } from "../../common/interfaces/paginated.interface";
import { FindByUserIdOutput } from "../ports/out/find-by-user-id-output";
import { ReservationStatus } from "../enum/reservation-status.enum";
import { FINE_RULES } from "../../common/constants/fine.constants";
import { FindReservationDto } from "../dto/query/find-reservation.dto";



export class FindByUserIdReservationUseCase {
    private readonly logger = new Logger(FindByUserIdReservationUseCase.name);

    constructor(
        @Inject("ReservationOutPort")
        private readonly reservationRepository: ReservationOutPort
    ) {}

    async execute(keycloackClientId: string, filters?: FindReservationDto): Promise<PaginatedResult<FindByUserIdOutput>> {
        this.logger.log(`[FIND-BY-USER-ID] Iniciando busca para usuário: ${keycloackClientId}`);
        this.logger.log(`[FIND-BY-USER-ID] Filtros aplicados:`, JSON.stringify(filters));

        try {
            const reservationFilters = {
                page: filters?.page || 1,
                limit: filters?.limit || 10,
                search: filters?.search,
                clientId: keycloackClientId,
                bookId: filters?.bookId,
                status: filters?.status,
                overdueOnly: filters?.overdueOnly
            };

            this.logger.log(`[FIND-BY-USER-ID] Filtros finais:`, JSON.stringify(reservationFilters));
            const reservations = await this.reservationRepository.findAll(reservationFilters);
            this.logger.log(`[FIND-BY-USER-ID] Reservas encontradas: ${reservations?.data?.length || 0}`);

            // Retorna lista vazia em vez de erro quando não há reservas
            if(!reservations || reservations.data.length === 0) {
                this.logger.log(`[FIND-BY-USER-ID] Nenhuma reserva encontrada para o usuário ${keycloackClientId}`);
                return {
                    data: [],
                    meta: {
                        total: 0,
                        page: filters?.page || 1,
                        lastPage: 1
                    }
                };
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
                author: r.bookCopy?.book?.author || "",
                reservedAt: r.reservedAt,
                dueDate: r.dueDate,
                returnedAt: r.returnedAt || null,
                status: r.status,
                fineAmount: r.fineAmount ?? null,
                isOverdue,
                potentialFine,
            };
        });

            this.logger.log(`[FIND-BY-USER-ID] Processamento concluído com sucesso. Total de reservas processadas: ${data.length}`);
            return {
                data,
                meta: reservations.meta,
            };
        } catch (error) {
            this.logger.error(`[FIND-BY-USER-ID] Erro ao buscar reservas para usuário ${keycloackClientId}:`, error);
            throw error;
        }
    }
}