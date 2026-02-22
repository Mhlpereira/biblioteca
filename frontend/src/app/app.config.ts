// app.config.ts
import { ApplicationConfig, APP_INITIALIZER } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideNgxMask } from "ngx-mask";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { routes } from "./app.routes";
import { keycloakBearerInterceptor } from "./core/interceptors/keycloack.interceptos";
import { initKeycloakFactory } from "./core/auth/keycloack"; 
import { AuthService } from "./services/auth.service";

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideNgxMask(),
        provideHttpClient(withInterceptors([keycloakBearerInterceptor])),
        {
            provide: APP_INITIALIZER,
            useFactory: initKeycloakFactory, 
            deps: [AuthService],            
            multi: true,
        },
    ],
};