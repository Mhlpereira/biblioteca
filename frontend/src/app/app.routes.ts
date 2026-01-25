import { Routes } from "@angular/router";
import { LoginPage } from "./pages/auth/login/login.page";
import { RegisterPage } from "./pages/auth/register/register.page";
import { SidebarComponent } from "./components/layout/sidebar/sidebar.component";
import { authGuard } from "./core/guards/auth.guard";
import { CatalogPage } from "./pages/client/catalog/catalog.page";
import { NotFound } from "./pages/not-found/not-found.page";
import { DashboardPage } from "./pages/client/dashboard/dashboard.page";
import { SettingsPage } from "./pages/client/settings/settings.page";
import { UsersPage } from "./pages/admin/clients/user.page";
import { BookManagementPage } from "./pages/admin/books/book-management.page";
import { adminGuard } from "./core/guards/admin.guard";

export const routes: Routes = [
    { path: "login", component: LoginPage },
    { path: "register", component: RegisterPage },

    {
        path: "",
        component: SidebarComponent,
        canActivate: [authGuard], 
        children: [
            { path: "dashboard", component: DashboardPage },
            { path: "catalog", component: CatalogPage },
            { path: "settings", component: SettingsPage },
            {
                path: "admin",
                canActivate: [adminGuard], 
                children: [
                    { path: "dashboard", component: DashboardPage }, 
                    { path: "books", component: BookManagementPage }, 
                    { path: "users", component: UsersPage }, 
                ],
            },

            { path: "", redirectTo: "dashboard", pathMatch: "full" },
        ],
    },
    { path: "**", component: NotFound },
];
