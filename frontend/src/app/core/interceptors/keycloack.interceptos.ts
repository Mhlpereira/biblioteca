import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { TokenService } from "../services/token.service";
import { catchError, switchMap, throwError, from } from "rxjs";

export const keycloakBearerInterceptor: HttpInterceptorFn = (req, next) => {
    const tokenService = inject(TokenService);
    
    // Skip token for Keycloak token endpoint
    if (req.url.includes("/protocol/openid-connect/token")) {
        return next(req);
    }

    const token = tokenService.getAccessToken();

    if (!token) {
        return next(req);
    }

    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && tokenService.hasRefreshToken()) {
                // Token expired, try to refresh
                return from(refreshAndRetry(req, next, tokenService));
            }
            return throwError(() => error);
        })
    );
};

async function refreshAndRetry(req: any, next: any, tokenService: TokenService) {
    const { AuthService } = await import("../../services/auth.service");
    const authService = inject(AuthService);
    
    const refreshed = await authService.refreshAccessToken();
    if (refreshed) {
        const newToken = tokenService.getAccessToken();
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${newToken}`,
            },
        });
        return next(authReq).toPromise();
    }
    throw new Error("Token refresh failed");
}