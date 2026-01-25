import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoginRequest, RegisterRequest } from "../core/model/auth.models";
import { UserStore } from "../core/stores/user.store";
import { User } from "../core/model/user.model";
import { catchError, finalize, Observable, tap } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private http = inject(HttpClient);
    private userStore = inject(UserStore);
    private readonly API_URL = "http://localhost:3000/api";

    login(credentials: LoginRequest) {
        return this.http.post<User>(`${this.API_URL}/auth/login`, credentials, { withCredentials: true }).pipe(
            tap(user => {
                this.userStore.setUser(user);
            })
        );
    }

    logout() {
        return this.http.post<void>(`${this.API_URL}/auth/logout`, {}, { withCredentials: true }).pipe(
            finalize(() => {
                this.userStore.logout();
            })
        );
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.API_URL}/auth/me`, { withCredentials: true }).pipe(
            tap(user => {
                this.userStore.setUser(user);
            }),
            catchError(err => {
                this.userStore.logout();
                throw err;
            })
        );
    }

    register(data: RegisterRequest) {
        return this.http.post<void>(`${this.API_URL}/auth/register`, data);
    }
}
