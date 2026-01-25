import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../core/model/user.model";
import { API_BASE_URL } from "../core/constants/api.constants";
import { FindClientParams } from "../core/model/client.model";
import { PaginatedResult } from "../core/model/pagination.model";
import { Book, CreateBook, FindBooksQuery } from "../core/model/book.models";
import { Reservation } from "../core/model/reservation.model";

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

    getReservations(overdueOnly: boolean = false, page: number = 1): Observable<PaginatedResult<Reservation>> {
        let params = new HttpParams().set("page", page).set("limit", 10);
        if (overdueOnly) params = params.set("overdueOnly", "true");

        return this.http.get<PaginatedResult<Reservation>>(`${this.API_URL}/reservation`, {
            params,
            withCredentials: true,
        });
    }

    //BOOKS

    createBook(book: CreateBook): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/books`, book, {
            withCredentials: true,
        });
    }

    getBooks(query?: FindBooksQuery): Observable<PaginatedResult<Book>> {
        let params = new HttpParams();

        if (query) {
            if (query.title) params = params.set("title", query.title);
            if (query.author) params = params.set("author", query.author);
            if (query.onlyAvailable) params = params.set("onlyAvailable", "true");
        }

        if (!params.has("page")) params = params.set("page", 1);
        if (!params.has("limit")) params = params.set("limit", 10);

        return this.http.get<PaginatedResult<Book>>(this.API_URL, { params });
    }

    deactivateBook(id: string): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/books/${id}/deactivate`, {}, { withCredentials: true });
    }

    addBookCopy(bookId: string, quantity: number): Observable<void> {
        const body = { bookId, quantity };

        return this.http.post<void>(`${this.API_URL}/books/${bookId}/copies`, body, { withCredentials: true });
    }

    removeBookCopy(bookId: string, quantity: number): Observable<void> {
        const body = { bookId, quantity };

        return this.http.patch<void>(`${this.API_URL}/books/${bookId}/copies/remove`, body, { withCredentials: true });
    }
}
