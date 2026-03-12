import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../../services/auth.service';
import { RegisterFormComponent } from '../../../components/forms/register-form/register-form.component';

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

  async handleRegister(data: RegisterData) {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(data);
      this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
    } catch (err: any) {
      this.isLoading = false;
      if (err?.status === 409) {
        this.errorMessage = 'CPF ou e-mail já cadastrado.';
      } else {
        this.errorMessage = err.error?.message || 'Erro ao criar conta. Tente novamente.';
      }
    }
  }
}