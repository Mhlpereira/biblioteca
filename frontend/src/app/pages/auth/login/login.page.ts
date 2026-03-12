import { Component, inject, OnInit } from "@angular/core";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { LoginFormComponent } from "../../../components/forms/login-form/login-form.component";
import { UserStore } from "../../../core/stores/user.store";

export interface LoginCredentials {
    username: string;
    password: string;
}

@Component({
    selector: "app-login-page",
    standalone: true,
    imports: [LoginFormComponent, RouterLink],
    templateUrl: "./login.page.html",
    styleUrl: "./login.css",
})
export class LoginPage implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    public userStore = inject(UserStore);

    isLoading = false;
    errorMessage = "";
    successMessage = "";
    private returnUrl = "/dashboard";

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/dashboard";

        if (this.route.snapshot.queryParams["registered"] === "true") {
            this.successMessage = "Conta criada com sucesso! Faça login para continuar.";
        }
        
        if (this.authService.isAuthenticated()) {
            this.router.navigate([this.returnUrl]);
        }
    }

    async handleLogin(credentials: LoginCredentials) {
        this.isLoading = true;
        this.errorMessage = "";

        try {
            await this.authService.login(credentials.username, credentials.password);
            this.router.navigate([this.returnUrl]);
        } catch (err: any) {
            this.isLoading = false;
            if (err?.status === 401) {
                this.errorMessage = "Usuário ou senha inválidos.";
            } else {
                this.errorMessage = "Erro ao fazer login. Tente novamente.";
            }
            console.error(err);
        }
    }
}
