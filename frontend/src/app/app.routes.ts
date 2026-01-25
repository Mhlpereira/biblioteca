import { Routes } from "@angular/router";
import { LoginPageComponent } from "./pages/login/login.page";

export const routes: Routes = [{ path: "", component: LoginPageComponent }];

/*

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; // Importe

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [authGuard] // <--- AQUI: Só entra se passar no guard
  },
  // Dica: Agrupe rotas protegidas assim:
  {
    path: '',
    canActivate: [authGuard], // Protege tudo que estiver dentro
    children: [
      { path: 'perfil', ... },
      { path: 'configuracoes', ... }
    ]
  }
];

*/
