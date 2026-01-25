import { Routes } from "@angular/router";
import { LoginPage } from "./pages/auth/login/login.page";
import { RegisterPage } from "./pages/auth/register/register.page";
import { SidebarComponent } from "./components/layout/sidebar/sidebar.component";
import { authGuard } from "./core/guards/auth.guard";
import { CatalogPage } from "./pages/client/catalog/catalog.page";
import { NotFound } from "./pages/not-found/not-found.page";
import { DashboardPage } from "./pages/client/dashboard/dashboard.page";

export const routes: Routes = [
    { path: "", component: LoginPage },
    { path: "registro", component: RegisterPage },
    { path: "catalogo", component: CatalogPage },
    { path: "reserva", component: DashboardPage },

    { path: "", component: SidebarComponent, canActivate: [authGuard], children: [] },

    { path: "**", component: NotFound },
];
