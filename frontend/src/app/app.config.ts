// app.config.ts
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideNgxMask } from "ngx-mask";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { routes } from "./app.routes";
import { keycloakBearerInterceptor } from "./core/interceptors/keycloack.interceptos";

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideNgxMask(),
        provideHttpClient(withInterceptors([keycloakBearerInterceptor])),
    ],
};