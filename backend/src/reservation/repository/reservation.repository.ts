import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginatedResult } from "../../common/interfaces/paginated.interface";
import { Reservation } from "../entities/reservation.entity";
import { ReservationStatus } from "../enum/reservation-status.enum";
import { ReservationOutPort } from "../ports/reservation-out.port";
import { ReservationFilters } from "../ports/in/reservation-filters.in";

@Injectable()
export class ReservationRepository implements ReservationOutPort {
    private readonly logger = new Logger(ReservationRepository.name);
    private readonly elasticUrl: string | undefined;

    constructor(
        @InjectRepository(Reservation)
        private readonly repository: Repository<Reservation>,
        private readonly configService: ConfigService
    ) {
        this.elasticUrl = this.configService.get<string>("ELASTIC_URL");
    }

    async create(data: Partial<Reservation>): Promise<Reservation> {
        const reservation = this.repository.create(data);
        return this.repository.save(reservation);
    }

    async findById(id: string): Promise<Reservation | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByUserId(id: string): Promise<PaginatedResult<Reservation>> {
        const reservations = await this.repository.find({
            where: { keycloackClientId: id },
            relations: ["bookCopy", "bookCopy.book"]
        });

        return {
            data: reservations,
            meta: {
                total: reservations.length,
                page: 1,
                lastPage: 1
            }
        };
    }

    async findByIdWithBookCopy(id: string): Promise<Reservation | null> {
        return this.repository.findOne({
            where: { id },
            relations: ["bookCopy", "bookCopy.book"],
        });
    }

    async save(reservation: Reservation): Promise<Reservation> {
        return this.repository.save(reservation);
    }

    async remove(reservation: Reservation): Promise<void> {
        await this.repository.remove(reservation);
    }

    async findAll(filters: ReservationFilters): Promise<PaginatedResult<Reservation>> {
        this.logger.log(`[REPOSITORY] Iniciando busca com filtros:`, JSON.stringify(filters));

        try {
            const result = await this.findAllFromElastic(filters);
            this.logger.log(`[REPOSITORY] Busca no Elasticsearch concluida com ${result.data.length} registros.`);
            return result;
        } catch (error) {
            this.logger.warn(`[REPOSITORY] Falha no Elasticsearch, aplicando fallback para banco relacional.`);
            this.logger.error(error);
            return this.findAllFromDatabase(filters);
        }
    }

    private async findAllFromElastic(filters: ReservationFilters): Promise<PaginatedResult<Reservation>> {
        if (!this.elasticUrl) {
            throw new Error("ELASTIC_URL nao configurado.");
        }

        const { page, limit } = filters;
        const from = (page - 1) * limit;
        const must: Record<string, unknown>[] = [];
        const filterClauses: Record<string, unknown>[] = [];
        const mustNot: Record<string, unknown>[] = [];

        const search = filters.search?.trim();
        if (search) {
            must.push({
                multi_match: {
                    query: search,
                    fields: [
                        "bookTitle^3",
                        "bookAuthor^2",
                        "reservation_id",
                        "bookId",
                        "bookCopyId",
                    ],
                    type: "best_fields",
                    fuzziness: "AUTO",
                },
            });
        }

        if (filters.clientId) {
            filterClauses.push({ term: { keycloackClientId: filters.clientId } });
        }

        if (filters.bookId) {
            filterClauses.push({ term: { bookId: filters.bookId } });
        }

        if (filters.status) {
            filterClauses.push({ term: { status: filters.status } });
        }

        if (filters.reservedAt) {
            filterClauses.push({ range: { reservedAt: { gte: filters.reservedAt } } });
        }

        if (filters.dueDate) {
            filterClauses.push({ range: { dueDate: { lte: filters.dueDate } } });
        }

        if (filters.returnedAt) {
            filterClauses.push({ range: { returnedAt: { lte: filters.returnedAt } } });
        }

        if (filters.overdueOnly) {
            filterClauses.push({ range: { dueDate: { lt: new Date().toISOString() } } });
            mustNot.push({ term: { status: ReservationStatus.RETURNED } });
        }

        const queryBody = {
            from,
            size: limit,
            track_total_hits: true,
            sort: [{ dueDate: { order: "asc" } }, { reservedAt: { order: "desc" } }],
            query: {
                bool: {
                    must,
                    filter: filterClauses,
                    must_not: mustNot,
                },
            },
        };

        const url = `${this.elasticUrl.replace(/\/$/, "")}/reservations/_search`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(queryBody),
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(`Elasticsearch respondeu ${response.status}: ${message}`);
        }

        const payload = (await response.json()) as {
            hits?: {
                total?: { value?: number } | number;
                hits?: Array<{ _source?: Record<string, unknown> }>;
            };
        };

        const totalRaw = payload.hits?.total;
        const total = typeof totalRaw === "number" ? totalRaw : (totalRaw?.value ?? 0);
        const hits = payload.hits?.hits ?? [];
        const data = hits
            .map((item) => this.mapElasticDocument(item._source))
            .filter((item): item is Reservation => item !== null);

        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }

    private async findAllFromDatabase(filters: ReservationFilters): Promise<PaginatedResult<Reservation>> {
        const { page, limit } = filters;
        const skip = (page - 1) * limit;

        const qb = this.repository
            .createQueryBuilder("reservation")
            .leftJoinAndSelect("reservation.bookCopy", "bookCopy")
            .leftJoinAndSelect("bookCopy.book", "book");

        if (filters.clientId) {
            qb.andWhere("reservation.keycloackClientId = :clientId", { clientId: filters.clientId });
        }

        if (filters.bookId) {
            qb.andWhere("book.id = :bookId", { bookId: filters.bookId });
        }

        if (filters.reservedAt) {
            qb.andWhere("reservation.reservedAt >= :reservedAt", {
                reservedAt: new Date(filters.reservedAt),
            });
        }

        if (filters.dueDate) {
            qb.andWhere("reservation.dueDate <= :dueDate", {
                dueDate: new Date(filters.dueDate),
            });
        }

        if (filters.returnedAt) {
            qb.andWhere("reservation.returnedAt <= :returnedAt", {
                returnedAt: new Date(filters.returnedAt),
            });
        }

        if (filters.status) {
            qb.andWhere("reservation.status = :status", { status: filters.status });
        }

        if (filters.overdueOnly) {
            qb.andWhere("reservation.dueDate < :now", { now: new Date() });
            qb.andWhere("reservation.status != :returned", { returned: ReservationStatus.RETURNED });
        }

        qb.orderBy("reservation.dueDate", "ASC").addOrderBy("reservation.reservedAt", "DESC");

        const total = await qb.getCount();
        const data = await qb.skip(skip).take(limit).getMany();

        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }

    private mapElasticDocument(source?: Record<string, unknown>): Reservation | null {
        if (!source) {
            return null;
        }

        const id = (source.reservation_id as string) || (source.id as string);
        if (!id) {
            return null;
        }

        const reservedAtRaw = source.reservedAt as string | undefined;
        const dueDateRaw = source.dueDate as string | undefined;
        if (!reservedAtRaw || !dueDateRaw) {
            return null;
        }

        return {
            id,
            keycloackClientId: (source.keycloackClientId as string) || "",
            reservedAt: new Date(reservedAtRaw),
            dueDate: new Date(dueDateRaw),
            returnedAt: source.returnedAt ? new Date(source.returnedAt as string) : null,
            status: (source.status as ReservationStatus) || ReservationStatus.ACTIVE,
            fineAmount: source.fineAmount !== undefined && source.fineAmount !== null ? Number(source.fineAmount) : null,
            daysLate: source.daysLate !== undefined && source.daysLate !== null ? Number(source.daysLate) : null,
            bookCopy: {
                id: (source.bookCopyId as string) || "",
                book: {
                    id: (source.bookId as string) || "",
                    title: (source.bookTitle as string) || "",
                    author: (source.bookAuthor as string) || "",
                    imageUrl: (source.bookImageUrl as string | null) ?? (source.bookImage as string | null) ?? null,
                },
            },
        } as unknown as Reservation;
    }
}
