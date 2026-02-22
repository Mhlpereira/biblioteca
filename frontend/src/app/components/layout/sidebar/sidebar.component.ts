import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { UserStore } from "../../../core/stores/user.store";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-sidebar",
    standalone: true,
    imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
    templateUrl: "./sidebar.component.html",
    styleUrl: "./sidebar.component.css",
})
export class SidebarComponent {
    private authService = inject(AuthService);
    private router = inject(Router);
    public userStore = inject(UserStore);

    logout() {
        this.authService.logout().then(() => {
            this.router.navigate(["/login"]);
        });
    }
}
