import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { API_BASE_URL } from "../core/constants/api.constants";
import { User } from "../core/model/user.model";
import { UserStore } from "../core/stores/user.store";
import { TokenService, TokenResponse } from "../core/services/token.service";

const KEYCLOAK_BASE_URL = "http://localhost:8081";
const KEYCLOAK_TOKEN_URL = `${KEYCLOAK_BASE_URL}/realms/biblioteca/protocol/openid-connect/token`;
const KEYCLOAK_ADMIN_TOKEN_URL = `${KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token`;
const KEYCLOAK_ADMIN_USERS_URL = `${KEYCLOAK_BASE_URL}/admin/realms/biblioteca/users`;
const KEYCLOAK_ADMIN_ROLES_URL = `${KEYCLOAK_BASE_URL}/admin/realms/biblioteca/roles`;

const KEYCLOAK_CLIENT_ID = "kong";
const KEYCLOAK_CLIENT_SECRET = "Pu8SyLkoaA9dXvHGWs7r3JosnSWSiwZp";
const KEYCLOAK_ADMIN_USERNAME = "admin";
const KEYCLOAK_ADMIN_PASSWORD = "admin";

export interface RegisterData {
    cpf: string;
    name: string;
    lastName: string;
    password: string;
}

interface KeycloakRole {
    id: string;
    name: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
    private http = inject(HttpClient);
    private userStore = inject(UserStore);
    private tokenService = inject(TokenService);
    private readonly API_URL = API_BASE_URL;

    async login(username: string, password: string): Promise<void> {
        const body = new URLSearchParams();
        body.set("grant_type", "password");
        body.set("client_id", KEYCLOAK_CLIENT_ID);
        body.set("client_secret", KEYCLOAK_CLIENT_SECRET);
        body.set("username", username);
        body.set("password", password);

        const headers = new HttpHeaders({
            "Content-Type": "application/x-www-form-urlencoded",
        });

        const response = await firstValueFrom(
            this.http.post<TokenResponse>(KEYCLOAK_TOKEN_URL, body.toString(), { headers })
        );

        this.tokenService.setTokens(response);
        await this.loadMe();
    }

    async refreshAccessToken(): Promise<boolean> {
        const refreshToken = this.tokenService.getRefreshToken();
        if (!refreshToken) return false;

        try {
            const body = new URLSearchParams();
            body.set("grant_type", "refresh_token");
            body.set("client_id", KEYCLOAK_CLIENT_ID);
            body.set("client_secret", KEYCLOAK_CLIENT_SECRET);
            body.set("refresh_token", refreshToken);

            const headers = new HttpHeaders({
                "Content-Type": "application/x-www-form-urlencoded",
            });

            const response = await firstValueFrom(
                this.http.post<TokenResponse>(KEYCLOAK_TOKEN_URL, body.toString(), { headers })
            );

            this.tokenService.setTokens(response);
            return true;
        } catch {
            this.logout();
            return false;
        }
    }

    logout(): void {
        this.tokenService.clearTokens();
        this.userStore.logout();
    }

    getProfile() {
        return this.http.get<User>(`${this.API_URL}/auth/me`);
    }

    async loadMe(): Promise<void> {
        try {
            const user = await firstValueFrom(this.getProfile());
            this.userStore.setUser(user);
            console.log("Usuário carregado:", user);
        } catch (err) {
            console.error("Erro ao carregar usuário:", err);
        }
    }

    async register(data: RegisterData): Promise<void> {
        // Step 1: Get admin token
        const adminToken = await this.getAdminToken();

        // Step 2: Create user in Keycloak
        const userId = await this.createKeycloakUser(adminToken, data);

        // Step 3: Assign USER role to the user
        await this.assignUserRole(adminToken, userId);
    }

    private async getAdminToken(): Promise<string> {
        const body = new URLSearchParams();
        body.set("grant_type", "password");
        body.set("client_id", "admin-cli");
        body.set("username", KEYCLOAK_ADMIN_USERNAME);
        body.set("password", KEYCLOAK_ADMIN_PASSWORD);

        const headers = new HttpHeaders({
            "Content-Type": "application/x-www-form-urlencoded",
        });

        const response = await firstValueFrom(
            this.http.post<TokenResponse>(KEYCLOAK_ADMIN_TOKEN_URL, body.toString(), { headers })
        );

        return response.access_token;
    }

    private async createKeycloakUser(adminToken: string, data: RegisterData): Promise<string> {
        const cpf = data.cpf.replace(/\D/g, ""); // Remove mask
        
        const userPayload = {
            username: cpf,
            firstName: data.name,
            lastName: data.lastName,
            enabled: true,
            credentials: [{
                type: "password",
                value: data.password,
                temporary: false
            }],
            attributes: {
                cpf: [cpf]
            }
        };

        const headers = new HttpHeaders({
            "Authorization": `Bearer ${adminToken}`,
            "Content-Type": "application/json",
        });

        const response = await firstValueFrom(
            this.http.post(KEYCLOAK_ADMIN_USERS_URL, userPayload, { 
                headers, 
                observe: "response" 
            })
        );

        // Extract user ID from Location header
        const location = response.headers.get("Location");
        if (!location) {
            throw new Error("User created but could not get user ID");
        }
        
        return location.split("/").pop()!;
    }

    private async assignUserRole(adminToken: string, userId: string): Promise<void> {
        const headers = new HttpHeaders({
            "Authorization": `Bearer ${adminToken}`,
            "Content-Type": "application/json",
        });

        // Get USER role details
        const role = await firstValueFrom(
            this.http.get<KeycloakRole>(`${KEYCLOAK_ADMIN_ROLES_URL}/USER`, { headers })
        );

        // Assign role to user
        await firstValueFrom(
            this.http.post(
                `${KEYCLOAK_ADMIN_USERS_URL}/${userId}/role-mappings/realm`,
                [{ id: role.id, name: role.name }],
                { headers }
            )
        );
    }

    isAuthenticated(): boolean {
        return this.tokenService.hasValidToken() || this.tokenService.hasRefreshToken();
    }
}
