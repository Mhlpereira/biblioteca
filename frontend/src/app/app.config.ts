import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideNgxMask } from "ngx-mask";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { credentialsInterceptor } from "./core/interceptors/credentials.interceptos";

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideNgxMask(),
        provideHttpClient(withInterceptors([credentialsInterceptor])),
    ],
};
