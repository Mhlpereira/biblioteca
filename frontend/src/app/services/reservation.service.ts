import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { CreateReservation, Reservation } from "../core/model/reservation.model";
import { API_BASE_URL } from "../core/constants/api.constants";
import { PaginatedResult } from "../core/model/pagination.model";

@Injectable({
    providedIn: "root",
})
export class ReservationService {
    private http = inject(HttpClient);
    private readonly API_URL = API_BASE_URL;

    getMyReservations(page = 1, limit = 10, search?: string): Observable<PaginatedResult<Reservation>> {
        let params = new HttpParams().set("page", page).set("limit", limit);

        if (search?.trim()) {
            params = params.set("search", search.trim());
        }

        return this.http
            .get<PaginatedResult<Reservation>>(`${this.API_URL}/reservation/me`, {
                params,
                withCredentials: true,
            })
            .pipe(
                map((result) => ({
                    ...result,
                    data: result.data.map((reservation) => this.normalizeReservation(reservation)),
                }))
            );
    }

    returnBook(reservationId: string): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/reservation/return`, { id: reservationId }, { withCredentials: true });
    }

    
    create(dto: CreateReservation): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/reservation`, dto, { withCredentials: true });
    }

    private normalizeReservation(reservation: Reservation): Reservation {
        const raw = reservation as Reservation & {
            bookAuthor?: string;
            imageUrl?: string | null;
        };

        const isReturned = raw.isReturned ?? raw.status === "RETURNED";
        const status = isReturned ? "RETURNED" : reservation.status;
        const returnedAt = raw.returnedAt ?? null;
        const bookImage = raw.bookImage ?? raw.bookImageUrl ?? raw.imageUrl ?? null;
        const isOverdue = raw.isOverdue ?? (!isReturned && new Date(raw.dueDate).getTime() < Date.now());
        const author = raw.author ?? raw.bookAuthor ?? "";

        return {
            ...reservation,
            status,
            isReturned,
            returnedAt,
            bookImage,
            bookImageUrl: raw.bookImageUrl ?? bookImage,
            isOverdue,
            clientName: raw.clientName ?? "",
            author,
            fineAmount: raw.fineAmount ?? null,
        };
    }
}
