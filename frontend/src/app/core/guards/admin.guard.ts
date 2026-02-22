import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { UserStore } from "../stores/user.store";

export const adminGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  if (userStore.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/home']);
};