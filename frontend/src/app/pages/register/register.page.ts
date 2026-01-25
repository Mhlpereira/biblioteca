import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../model/auth.models';
import { LoginFormComponent } from '../../components/forms/login-form/login-form.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [LoginFormComponent, RouterLink], 
  templateUrl: './login.page.html',
  styleUrl: './login.css'
})
export class RegisterPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);


  isLoading = false;
  errorMessage = '';


  handleLogin(credentials: LoginRequest) {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'CPF ou senha incorretos.';
        console.error(err);
      }
    });
  }
}