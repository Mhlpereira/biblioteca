import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../core/model/user.model";
import { UpdateClientDto, UpdatePasswordDto } from "../core/model/client.model";
import { API_BASE_URL } from "../core/constants/api.constants";



@Injectable({ providedIn: "root" })
export class ClientService {
    private http = inject(HttpClient);
    private readonly API_URL = API_BASE_URL;

    updateProfile(dto: UpdateClientDto): Observable<User> {
        return this.http.patch<User>(`${this.API_URL}/client/me`, dto, { withCredentials: true });
    }

    changePassword(dto: UpdatePasswordDto): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/client/me/password`, dto, { withCredentials: true });
    }

    deleteAccount(): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/client/me`, { withCredentials: true });
    }
}