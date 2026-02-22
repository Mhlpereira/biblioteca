import { AuthService } from "../../services/auth.service";
import { keycloak } from "../interceptors/auth.interceptor";

// core/auth/keycloack.ts
export function initKeycloakFactory(authService: AuthService) {
    return async () => {
        const authenticated = await keycloak.init({
            onLoad: "login-required",
            pkceMethod: "S256",
            checkLoginIframe: false,
            redirectUri: window.location.origin + "/",
        });

        if (authenticated) {
            await authService.loadMe();
        }

        return authenticated;
    };
}