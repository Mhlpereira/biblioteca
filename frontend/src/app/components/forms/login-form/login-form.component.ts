import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { NgxMaskDirective } from "ngx-mask";

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

    // ✅ agora não envia credenciais
    @Output() loginSubmit = new EventEmitter<void>();

    showPassword = false;

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    form = this.fb.group({
        cpf: [""],
        password: [""],
    });

    onSubmit() {
        this.loginSubmit.emit();
    }
}
