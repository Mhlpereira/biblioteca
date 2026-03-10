import { Injectable } from "@angular/core";

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
}

@Injectable({ providedIn: "root" })
export class TokenService {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private expiresAt: number | null = null;

    setTokens(tokens: TokenResponse): void {
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
        this.expiresAt = Date.now() + tokens.expires_in * 1000;
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    isTokenExpired(): boolean {
        if (!this.expiresAt) return true;
        return Date.now() >= this.expiresAt - 30000;
    }

    hasValidToken(): boolean {
        return this.accessToken !== null && !this.isTokenExpired();
    }

    hasRefreshToken(): boolean {
        return this.refreshToken !== null;
    }

    clearTokens(): void {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
    }
}
