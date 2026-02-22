import { Component, inject, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { LoginRequest } from "../../../core/model/auth.models";
import { LoginFormComponent } from "../../../components/forms/login-form/login-form.component";
import { UserStore } from "../../../core/stores/user.store";

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
    public userStore = inject(UserStore);

    isLoading = false;
    errorMessage = "";

    ngOnInit() {
        if (this.userStore.isAuthenticated()) {
            this.router.navigate(["/dashboard"]);
        }
    }

    async handleLogin() {
        this.isLoading = true;
        this.errorMessage = "";

        try {
            await this.authService.login();
        } catch (err) {
            this.isLoading = false;
            this.errorMessage = "Não foi possível iniciar o login.";
            console.error(err);
        }
    }
}
