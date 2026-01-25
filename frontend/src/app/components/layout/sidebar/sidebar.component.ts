import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      }
    });
  }
}
