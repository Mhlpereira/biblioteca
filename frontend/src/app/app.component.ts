import { Component, OnInit, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "./services/auth.service"; 

@Component({
    selector: "app-root",
    standalone: true,
    imports: [RouterOutlet], 
    templateUrl: "./app.component.html", 
    styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
    private authService = inject(AuthService);

    isLoading = true;

    ngOnInit() {
        this.authService.getProfile().subscribe({
            next: () => {
                console.log("Sessão restaurada!");
                this.isLoading = false; 
            },
            error: () => {
                console.log("Visitante não logado.");
                this.isLoading = false; 
            },
        });
    }
}
