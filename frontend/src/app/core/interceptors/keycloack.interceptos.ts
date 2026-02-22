import { HttpInterceptorFn } from "@angular/common/http";
import { keycloak } from "./auth.interceptor";

export const keycloakBearerInterceptor: HttpInterceptorFn = (req, next) => {
    const token = keycloak.token;

    if (!token) {
        return next(req);
    }

    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    return next(authReq);
};