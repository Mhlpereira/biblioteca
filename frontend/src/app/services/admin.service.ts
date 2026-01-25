import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../core/model/user.model";
import { API_BASE_URL } from "../core/constants/api.constants";
import { FindClientParams } from "../core/model/client.model";
import { PaginatedResult } from "../core/model/pagination.model";
import { Book } from "../core/model/book.models";
import { Reservation } from "../core/model/reservation.model";

@Injectable({
    providedIn: "root",
})
export class AdminService {
    private http = inject(HttpClient);
    private readonly API_URL = `${API_BASE_URL}`;

    findAll(filters: FindClientParams): Observable<PaginatedResult<User>> {
        let params = new HttpParams();

        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== undefined && value !== null && value !== "") {
                params = params.set(key, value);
            }
        });

        return this.http.get<PaginatedResult<User>>(`${this.API_URL}/clients/findAll`, {
            params,
            withCredentials: true,
        });
    }

    getBooks(page: number = 1, limit: number = 10): Observable<PaginatedResult<Book>> {
        const params = new HttpParams().set("page", page).set("limit", limit);
        return this.http.get<PaginatedResult<Book>>(`${this.API_URL}/books`, { params, withCredentials: true });
    }

    getReservations(overdueOnly: boolean = false, page: number = 1): Observable<PaginatedResult<Reservation>> {
        let params = new HttpParams().set("page", page).set("limit", 10);
        if (overdueOnly) params = params.set("overdueOnly", "true");

        return this.http.get<PaginatedResult<Reservation>>(`${this.API_URL}/reservation`, {
            params,
            withCredentials: true,
        });
    }

    deactivateBook(id: string): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/books/${id}/deactivate`, {}, { withCredentials: true });
    }

    deleteUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${userId}`, { withCredentials: true });
    }
}
