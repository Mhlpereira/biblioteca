import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ClientService } from "../../../services/client.service";
import { AuthService } from "../../../services/auth.service"; // Para logout após deletar
import { CommonModule } from "@angular/common";
import { UserStore } from "../../../core/stores/user.store";

@Component({
    selector: "app-settings-page",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: "./settings.page.html",
})
export class SettingsPage implements OnInit {
    private fb = inject(FormBuilder);
    private clientService = inject(ClientService);
    private authService = inject(AuthService);
    private userStore = inject(UserStore);

    isLoading = false;
    message = { type: "", text: "" };

    profileForm = this.fb.group({
        name: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        cpf: [""],
    });

    passwordForm = this.fb.group({
        oldPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(8)]],
    });

    ngOnInit() {
        const user = this.userStore.user(); 
        if (user) {
            this.profileForm.patchValue({
                name: user.name
            });
        }
    }

    onUpdateProfile() {
        if (this.profileForm.invalid) return;
        this.isLoading = true;

        this.clientService.updateProfile(this.profileForm.value as any).subscribe({
            next: () => {
                this.isLoading = false;
                this.showMessage("success", "Perfil atualizado com sucesso!");
            },
            error: () => {
                this.isLoading = false;
                this.showMessage("error", "Erro ao atualizar perfil.");
            },
        });
    }

    onChangePassword() {
        if (this.passwordForm.invalid) return;
        this.isLoading = true;

        this.clientService.changePassword(this.passwordForm.value as any).subscribe({
            next: () => {
                this.isLoading = false;
                this.passwordForm.reset();
                this.showMessage("success", "Senha alterada com sucesso!");
            },
            error: err => {
                this.isLoading = false;
                this.showMessage("error", err.error?.message || "Erro ao alterar senha.");
            },
        });
    }

    onDeleteAccount() {
        const confirm = window.confirm(
            "Tem certeza absoluta? Essa ação não pode ser desfeita e você perderá todo seu histórico."
        );

        if (confirm) {
            this.isLoading = true;
            this.clientService.deleteAccount().subscribe({
                next: () => {
                    this.authService.logout()
                        .then(() => {})
                        .catch(() => {});
                },
                error: () => {
                    this.isLoading = false;
                    this.showMessage("error", "Não foi possível excluir a conta. Verifique se não há pendências.");
                },
            });
        }
    }

    private showMessage(type: "success" | "error", text: string) {
        this.message = { type, text };
        setTimeout(() => (this.message = { type: "", text: "" }), 5000);
    }
}
