import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { NgxMaskDirective } from "ngx-mask";

export interface LoginCredentials {
    username: string;
    password: string;
}

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

    @Output() loginSubmit = new EventEmitter<LoginCredentials>();

    showPassword = false;

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    form = this.fb.group({
        cpf: [""],
        password: [""],
    });

    onSubmit() {
        if (this.form.valid) {
            const cpf = this.form.get("cpf")?.value || "";
            // Remove mask characters from CPF to use as username
            const username = cpf.replace(/\D/g, "");
            const password = this.form.get("password")?.value || "";
            
            this.loginSubmit.emit({ username, password });
        }
    }
}
