import { computed, Injectable, signal } from "@angular/core";
import { User } from "../model/user.model";

@Injectable({ providedIn: "root" })
export class UserStore {
    private userSignal = signal<User | null>(null);

    readonly user = this.userSignal.asReadonly();
    readonly isAuthenticated = computed(() => !!this.userSignal());

    setUser(user: User) {
        this.userSignal.set(user);
    }

    logout() {
        this.userSignal.set(null);
    }
}
