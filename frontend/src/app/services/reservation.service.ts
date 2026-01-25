import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../core/model/reservation.model';
import { API_BASE_URL } from '../core/constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private readonly API_URL = API_BASE_URL; 

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.API_URL}/reservation/me`, { withCredentials: true });
  }

  returnBook(reservationId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/reservation/return`, { reservationId }, { withCredentials: true });
}
}