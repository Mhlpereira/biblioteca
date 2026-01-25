import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { UserStore } from "../stores/user.store";

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const userStore = inject(UserStore);

    if (userStore.isAuthenticated()) {
        return true; 
    }

    return router.createUrlTree(["/login"]);
};
