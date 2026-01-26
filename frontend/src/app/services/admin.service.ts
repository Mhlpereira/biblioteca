import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
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

        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== undefined && value !== null && value !== "") {
                params = params.set(key, value);
            }
        });

        return this.http.get<PaginatedResult<User>>(`${this.API_URL}/clients`, {
            params,
            withCredentials: true,
        });
    }

    deleteUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${userId}`, { withCredentials: true });
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

        return this.http.get<PaginatedResult<Reservation>>(`${this.API_URL}/reservation`, {
            params,
            withCredentials: true,
        });
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

        return this.http.get<PaginatedResult<Reservation>>(`${this.API_URL}/reservation`, {
            params,
            withCredentials: true,
        });
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
}
