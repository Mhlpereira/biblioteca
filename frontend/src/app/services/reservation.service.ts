import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateReservation, Reservation } from "../core/model/reservation.model";
import { API_BASE_URL } from "../core/constants/api.constants";
import { PaginatedResult } from "../core/model/pagination.model";

@Injectable({
    providedIn: "root",
})
export class ReservationService {
    private http = inject(HttpClient);
    private readonly API_URL = API_BASE_URL;

    getMyReservations(page = 1, limit = 10): Observable<PaginatedResult<Reservation>> {
        const params = new HttpParams().set("page", page).set("limit", limit);
        return this.http.get<PaginatedResult<Reservation>>(`${this.API_URL}/reservation/me`, {
            params,
            withCredentials: true,
        });
    }

    returnBook(reservationId: string): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/reservation/return`, { reservationId }, { withCredentials: true });
    }

    
    create(dto: CreateReservation): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/reservation`, dto, { withCredentials: true });
    }
}
