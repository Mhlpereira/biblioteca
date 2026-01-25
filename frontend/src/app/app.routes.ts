import { Routes } from "@angular/router";
import { LoginPage } from "./pages/auth/login/login.page";
import { RegisterPage } from "./pages/auth/register/register.page";
import { SidebarComponent } from "./components/layout/sidebar/sidebar.component";
import { authGuard } from "./core/guards/auth.guard";
import { CatalogPage } from "./pages/client/catalog/catalog.page";

export const routes: Routes = [
    { path: "", component: LoginPage },
    { path: "register", component: RegisterPage },
    { path: "catalog", component: CatalogPage },

    { path: "", component: SidebarComponent, canActivate: [authGuard], children: [] },
];
