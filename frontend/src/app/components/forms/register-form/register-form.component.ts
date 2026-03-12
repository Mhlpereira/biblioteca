import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CommonModule } from '@angular/common'; // Para animações se necessário
import { CpfValidator } from '../../../shared/validators/cpf.validator';
import { RegisterData } from '../../../services/auth.service';
import { MatchValidator } from '../../../shared/validators/match.validator';
import { PasswordValidator } from '../../../shared/validators/password.validator';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective, CommonModule],
  providers: [provideNgxMask()],
  templateUrl: './register-form.component.html'
})
export class RegisterFormComponent {
  private fb = inject(FormBuilder);

  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Output() registerSubmit = new EventEmitter<RegisterData>();

  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group({
    cpf: ['', [Validators.required, CpfValidator.validate]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), PasswordValidator.strength]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: [MatchValidator.match('password', 'confirmPassword')]
  });

  onSubmit() {
    if (this.form.valid) {
      this.registerSubmit.emit(this.form.value as RegisterData);
    } else {
      this.form.markAllAsTouched();
    }
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }
}