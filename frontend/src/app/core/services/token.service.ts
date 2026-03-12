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

  setTokens(tokens: TokenResponse): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('expires_at', String(Date.now() + tokens.expires_in * 1000));
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('expires_at');
    if (!expiresAt) return true;
    return Date.now() >= Number(expiresAt) - 30000;
  }

  hasValidToken(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  }

  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
  }
}