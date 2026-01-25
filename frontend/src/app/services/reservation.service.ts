import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../core/model/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000'; 

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.API_URL}/reservation/me`, { withCredentials: true });
  }
}