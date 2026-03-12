import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
import { CpfValidator } from "../../../shared/validators/cpf.validator";

export interface LoginCredentials {
    username: string;
    password: string;
}

@Component({
    selector: "app-login-form",
    standalone: true,
    imports: [ReactiveFormsModule, NgxMaskDirective],
    providers: [provideNgxMask()],
    templateUrl: "./login-form.component.html",
})
export class LoginFormComponent {
    private fb = inject(FormBuilder);

    @Input() isLoading = false;
    @Input() errorMessage = "";

    @Output() loginSubmit = new EventEmitter<LoginCredentials>();

    showPassword = false;

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    form = this.fb.group({
        cpf: ["", [Validators.required, CpfValidator.validate]],
        password: ["", [Validators.required]],
    });

    onSubmit() {
        if (this.form.valid) {
            const cpf = this.form.get("cpf")?.value || "";
            // Remove mask characters from CPF to use as username
            const username = cpf.replace(/\D/g, "");
            const password = this.form.get("password")?.value || "";
            
            this.loginSubmit.emit({ username, password });
        } else {
            this.form.markAllAsTouched();
        }
    }
}
