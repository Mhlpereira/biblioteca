import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { KeycloakService } from "keycloak-angular";

export const authInterceptor: HttpInterceptorFn = async (req, next) => {
    const keycloak = inject(KeycloakService);

    const isApiCall = req.url.startsWith("http://localhost:8000");

    if (!isApiCall) return next(req);

    const token = await keycloak.getToken();
    if (!token) return next(req);

    return next(
        req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        })
    );
};
