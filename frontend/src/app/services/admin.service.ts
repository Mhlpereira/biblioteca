import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { User } from "../core/model/user.model";
import { API_BASE_URL } from "../core/constants/api.constants";
import { FindClientParams } from "../core/model/client.model";
import { PaginatedResult } from "../core/model/pagination.model";
import { AddCopy, Book, CreateBook, FindBooksQuery, RemoveCopy } from "../core/model/book.models";
import { Reservation, ReservationFilters } from "../core/model/reservation.model";

@Injectable({
    providedIn: "root",
})
export class AdminService {
    private http = inject(HttpClient);
    private readonly API_URL = `${API_BASE_URL}`;

    //CLIENTS

    findAll(filters: FindClientParams): Observable<PaginatedResult<User>> {
        let params = new HttpParams();

        if (filters.page) params = params.set('page', filters.page);
        if (filters.limit) params = params.set('limit', filters.limit);
        if (filters.name) params = params.set('search', filters.name);

        return this.http.get<PaginatedResult<User>>(`${this.API_URL}/auth/users`, {
            params,
            withCredentials: true,
        });
    }

    deleteUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/clients/${userId}`, { withCredentials: true });
    }

    //RESERVATION

    getReservations(
        overdueOnly: boolean = false,
        page: number = 1,
        limit: number = 10
    ): Observable<PaginatedResult<Reservation>> {
        let params = new HttpParams().set("page", page.toString()).set("limit", limit.toString());

        if (overdueOnly) {
            params = params.set("overdueOnly", 'true');
        }

        return this.http
            .get<PaginatedResult<Reservation>>(`${this.API_URL}/reservation`, {
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

    getReservationsWithFilters(filters: ReservationFilters): Observable<PaginatedResult<Reservation>> {
        let params = new HttpParams()
            .set("page", (filters.page || 1).toString())
            .set("limit", (filters.limit || 10).toString());

        if (filters.overdueOnly) {
            params = params.set("overdueOnly", "true");
        }

        if (filters.status) {
            params = params.set("status", filters.status);
        }

        if (filters.clientId) {
            params = params.set("clientId", filters.clientId);
        }

        if (filters.bookId) {
            params = params.set("bookId", filters.bookId);
        }

        return this.http
            .get<PaginatedResult<Reservation>>(`${this.API_URL}/reservation`, {
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

    createReservation() {}

    //BOOKS

    createBook(book: CreateBook): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/books`, book, {
            withCredentials: true,
        });
    }

    deactivateBook(id: string): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/books/${id}/deactivate`, {}, { withCredentials: true });
    }

    addBookCopy(dto: AddCopy): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/books/${dto.bookId}/copies`, dto, { withCredentials: true });
    }

    removeBookCopy(dto: RemoveCopy): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/books/${dto.bookId}/copies/remove`, dto, {
            withCredentials: true,
        });
    }

    deleteBook(bookId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/books/${bookId}`, { withCredentials: true });
    }

    deleteReservation(reservationId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/reservation/${reservationId}`, { withCredentials: true });
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
            clientName: raw.clientName ?? raw.id,
            author,
            fineAmount: raw.fineAmount ?? null,
        };
    }
}
