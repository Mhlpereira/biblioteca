import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { UserStore } from "../stores/user.store";
import { AuthService } from "../../services/auth.service";
import { catchError, map, of } from "rxjs";

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const userStore = inject(UserStore);
    const authService = inject(AuthService);

    if (userStore.isAuthenticated()) {
        return true; 
    }

    return authService.getProfile().pipe(
        map((user) => {
            return true;
        }),
        catchError(() => {
            return of(router.createUrlTree(["/"]));
        })
    );
}