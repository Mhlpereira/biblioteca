import { Component, inject, OnInit, signal } from "@angular/core";
import { PaginationComponent } from "../../../components/ui/pagination/pagination.component";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { AdminService } from "../../../services/admin.service";
import { CreateBookModalComponent } from "../../../components/admin/create-book-modal/create-book-modal.component";
import { CreateBook } from "../../../core/model/book.models";

@Component({
    selector: "app-book-management",
    standalone: true,
    imports: [CommonModule, PaginationComponent, DatePipe, CurrencyPipe, CreateBookModalComponent],
    templateUrl: "./book-management.page.html",
})
export class BookManagementPage implements OnInit {
    private adminService = inject(AdminService);

    activeTab = signal<"inventory" | "overdue">("inventory");
    books = signal<any[]>([]);
    overdueReservations = signal<any[]>([]);
    showCreateModal = signal(false);

    isLoading = signal(false);
    meta = signal({ page: 1, lastPage: 1, total: 0 });
    searchTerm = signal<string>("");

    ngOnInit() {
        this.loadData();
    }

    switchTab(tab: "inventory" | "overdue") {
        this.activeTab.set(tab);
        this.loadData(1);
    }

    loadData(page: number = 1) {
        this.isLoading.set(true);
        if (this.activeTab() === "inventory") {
            this.adminService.getBooks(page, 10, this.searchTerm()).subscribe({
                next: res => this.handleResponse(res),
                error: err => {
                    console.error("Erro ao carregar livros:", err);
                    this.isLoading.set(false);
                },
            });
        } else {
            this.adminService.getReservations(true, page).subscribe({
                next: res => this.handleResponse(res),
                error: err => {
                    console.error("Erro ao carregar reservas:", err);
                    this.isLoading.set(false);
                },
            });
        }
    }

    openCreateModal() {
        this.showCreateModal.set(true);
    }
    closeCreateModal() {
        this.showCreateModal.set(false);
    }

    handleCreateBook(bookData: CreateBook) {
        this.isLoading.set(true); 

        this.adminService.createBook(bookData).subscribe({
            next: () => {
                alert("Livro criado com sucesso!");
                this.closeCreateModal(); 
                this.loadData(); 
                this.isLoading.set(false);
            },
            error: err => {
                console.error("Erro ao criar livro:", err);
                alert("Erro ao criar livro. Verifique o console.");
                this.isLoading.set(false);
            },
        });
    }

    private handleResponse(res: any) {
        if (this.activeTab() === "inventory") this.books.set(res.data);
        else this.overdueReservations.set(res.data);

        this.meta.set(res.meta);
        this.isLoading.set(false);
    }

    onDeactivate(id: string) {
        if (confirm("Desativar este livro impedirá novas cópias e reservas. Continuar?")) {
            this.adminService.deactivateBook(id).subscribe(() => this.loadData());
        }
    }

    onSearchChange(term: string) {
        this.searchTerm.set(term);
        this.loadData(1);
    }
}
