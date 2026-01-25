import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AdminService } from "../../../services/admin.service";
import { User } from "../../../core/model/user.model";
import { PaginationComponent } from "../../../components/ui/pagination/pagination.component"; // Importe o componente
import { FindClientParams } from "../../../core/model/client.model";
import { PaginatedResult } from "../../../core/model/pagination.model";

@Component({
    selector: "app-users-page",
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent], // <--- Adicione aqui
    templateUrl: "./users.page.html",
})
export class UsersPage implements OnInit {
    private adminService = inject(AdminService);

    users = signal<User[]>([]);

    meta = signal<PaginatedResult<any>["meta"]>({
        total: 0,
        page: 1,
        lastPage: 1,
    });

    isLoading = signal(false);

    filters = signal<FindClientParams>({
        page: 1,
        limit: 10,
        name: "",
        role: "",
    });

    searchTerm = signal("");

    ngOnInit() {
        this.fetchUsers();
    }

    fetchUsers() {
        this.isLoading.set(true);
        this.adminService.findAll(this.filters()).subscribe({
            next: response => {
                this.users.set(response.data);
                this.meta.set(response.meta); 
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false),
        });
    }

    onPageChange(newPage: number) {
        this.filters.update(f => ({ ...f, page: newPage }));
        this.fetchUsers();
    }

    onSearch() {
        this.filters.update(f => ({ ...f, page: 1 }));
        this.fetchUsers();
    }

    filteredUsers() {
        const term = this.searchTerm().toLowerCase();
        return this.users().filter(user =>
            user.name.toLowerCase().includes(term) ||
            user.cpf?.includes(term)
        );
    }

    isAdmin(user: User): boolean {
        return user.role === 'ADMIN';
    }

    onDelete(user: User) {
        if (confirm(`Deseja realmente excluir o usuário ${user.name}?`)) {
            // this.adminService.deleteUser(user.id).subscribe(() => this.fetchUsers());
        }
    }
}
