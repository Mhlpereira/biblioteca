import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoginRequest } from "../model/auth.models";
import { UserStore } from "../core/stores/user.store";
import { User } from "../model/user.model";
import { catchError, Observable, tap } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private http = inject(HttpClient);
    private userStore = inject(UserStore);
    private readonly API_URL = "http://localhost:3000/api";

    login(credentials: LoginRequest) {
        return this.http.post<User>(`${this.API_URL}/login`, credentials, { withCredentials: true }).pipe(
            tap(user => {
                this.userStore.setUser(user);
            })
        );
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.API_URL}/me`, { withCredentials: true }).pipe(
            tap(user => {
                this.userStore.setUser(user); 
            }),
            catchError(err => {
                this.userStore.logout();
                throw err;
            })
        );
    }
}
