import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { User } from "../model/user.model";

type UserState = { user: User | null };

export const UserStore = signalStore(
    { providedIn: "root" },
    withState<UserState>({ user: null }),
    withMethods(store => ({
        setUser(user: User) {
            patchState(store, { user });
        },
        logout() {
            patchState(store, { user: null });
        },
        isAdmin() {
            return store.user()?.role === "ADMIN";
        },
        isAuthenticated() {
            return store.user() !== null;
        },
    }))
);
