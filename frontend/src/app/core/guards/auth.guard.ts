import { CanActivateFn } from "@angular/router";
import { keycloak } from "../interceptors/auth.interceptor";

export const authGuard: CanActivateFn = async (route, state) => {
    try {
        if (keycloak.authenticated) {
            await keycloak.updateToken(10); 
            return true;
        }
    } catch {}

    await keycloak.login({
        redirectUri: window.location.origin + state.url, 
    });

    return false;
};
