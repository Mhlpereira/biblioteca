import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterFormComponent } from '../../../components/forms/register-form/register-form.component';
import { RegisterRequest } from '../../../core/model/auth.models';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RegisterFormComponent, RouterLink],
  templateUrl: './register.page.html',
  styleUrl: './register.page.css'
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  handleRegister(data: RegisterRequest) {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao criar conta. Tente novamente.';
      }
    });
  }
}