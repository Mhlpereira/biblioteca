import { Component, EventEmitter, Input, Output, inject } from "@angular/core"; // <--- Adicione Input e Output
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgxMaskDirective } from "ngx-mask";
import { LoginRequest } from "../../../model/auth.models";
import { PasswordValidator } from "../../../shared/validators/password.validator";

@Component({
    selector: "app-login-form",
    standalone: true,
    imports: [ReactiveFormsModule, NgxMaskDirective],
    templateUrl: "./login-form.component.html",
})
export class LoginFormComponent {
    private fb = inject(FormBuilder);

    @Input() isLoading = false;
    @Input() errorMessage = "";

    @Output() loginSubmit = new EventEmitter<LoginRequest>();

    showPassword = false;

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    form = this.fb.group({
        cpf: ["", [Validators.required]],
        password: ["", [Validators.required, Validators.minLength(8), PasswordValidator.strength]],
    });

    onSubmit() {
        if (this.form.valid) {
            const request: LoginRequest = {
                cpf: this.form.value.cpf!,
                password: this.form.value.password!,
            };
            this.loginSubmit.emit(request);
        } else {
            this.form.markAllAsTouched();
        }
    }
}
