import { APP_INITIALIZER, ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import Keycloak from "keycloak-js";

import { routes } from "../../app.routes";
import { AuthService } from "../../services/auth.service";
import { keycloakBearerInterceptor } from "./keycloack.interceptos";

export const keycloak = new Keycloak({
    url: "http://localhost:8081",
    realm: "biblioteca",
    clientId: "frontend",
});

export function initKeycloakFactory(authService: AuthService) {
    return async () => {
        try {
            const authenticated = await keycloak.init({
                onLoad: "login-required",
                pkceMethod: "S256",
                checkLoginIframe: false,
                redirectUri: window.location.origin + "/",
            });

            console.log("Autenticado:", authenticated); 

            if (authenticated) {
                await authService.loadMe();
            }

            return authenticated;
        } catch (err) {
            console.error("Erro no init do Keycloak:", err); 
            return false;
        }
    };
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([keycloakBearerInterceptor])),
        {
            provide: APP_INITIALIZER,
            useFactory: initKeycloakFactory,
            deps: [AuthService],
            multi: true,
        },
    ],
};
