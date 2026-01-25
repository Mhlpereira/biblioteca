import { computed, Injectable, signal } from "@angular/core";
import { User } from "../model/user.model";
import { Role } from "../enums/role.enum";

@Injectable({ providedIn: "root" })
export class UserStore {
    private userSignal = signal<User | null>(null);

    readonly user = this.userSignal.asReadonly();
    readonly isAuthenticated = computed(() => !!this.userSignal());

    readonly isAdmin = computed(() => {
        const user = this.userSignal();
        return user?.role === Role.ADMIN;
    });

    setUser(user: User) {
        this.userSignal.set(user);
    }

    logout() {
        this.userSignal.set(null);
    }
}
