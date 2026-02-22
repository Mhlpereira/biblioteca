import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { API_BASE_URL } from "../core/constants/api.constants";
import { User } from "../core/model/user.model";
import { UserStore } from "../core/stores/user.store";
import { keycloak } from "../core/interceptors/auth.interceptor";

@Injectable({ providedIn: "root" })
export class AuthService {
    private http = inject(HttpClient);
    private userStore = inject(UserStore);
    private readonly API_URL = API_BASE_URL;

    login(): Promise<void> {
        return keycloak.login({ redirectUri: window.location.origin + "/" });
    }

    logout(): Promise<void> {
        this.userStore.logout();
        return keycloak.logout({ redirectUri: window.location.origin + "/login" });
    }

    getProfile() {
        return this.http.get<User>(`${this.API_URL}/auth/me`);
    }

    async loadMe(): Promise<void> {
        try {
            const user = await firstValueFrom(this.getProfile());
            this.userStore.setUser(user);
            console.log("Usuário carregado:", user); // ← adicione
        } catch (err) {
            console.error("Erro ao carregar usuário:", err); // ← adicione
        }
    }
    
    register(data: any) {
        return this.http.post(`${this.API_URL}/auth/register`, data);
    }
}
