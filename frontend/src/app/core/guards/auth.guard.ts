import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { TokenService } from "../services/token.service";
import { AuthService } from "../../services/auth.service";

export const authGuard: CanActivateFn = async (route, state) => {
    const router = inject(Router);
    const tokenService = inject(TokenService);
    const authService = inject(AuthService);
    
    // Check if we have a valid token
    if (tokenService.hasValidToken()) {
        return true;
    }

    // Try to refresh if we have a refresh token
    if (tokenService.hasRefreshToken()) {
        const refreshed = await authService.refreshAccessToken();
        if (refreshed) {
            return true;
        }
    }

    // Redirect to login page
    router.navigate(["/login"], { 
        queryParams: { returnUrl: state.url } 
    });

    return false;
};
