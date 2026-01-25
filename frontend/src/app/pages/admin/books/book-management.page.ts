import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { PaginationComponent } from "../../../components/ui/pagination/pagination.component";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { AdminService } from "../../../services/admin.service";
import { CreateBookModalComponent } from "../../../components/admin/create-book-modal/create-book-modal.component";
import { CreateBook, FindBooksQuery } from "../../../core/model/book.models";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from "rxjs";
import { BookListComponent } from "../../../components/admin/list-book-component/list-book-modal.component";
import { BookService } from "../../../services/book.service";
import { SettingsBookModalComponent } from "../../../components/admin/settings-book-modal/settings-book-modal.component";

@Component({
    selector: "app-book-management",
    standalone: true,
    imports: [
        CommonModule,
        PaginationComponent,
        DatePipe,
        CurrencyPipe,
        CreateBookModalComponent,
        BookListComponent,
        SettingsBookModalComponent,
    ],
    templateUrl: "./book-management.page.html",
})
export class BookManagementPage implements OnInit, OnDestroy {
    private adminService = inject(AdminService);
    private bookService = inject(BookService);

    activeTab = signal<"inventory" | "overdue">("inventory");
    books = signal<any[]>([]);
    overdueReservations = signal<any[]>([]);
    showCreateModal = signal(false);

    selectedBook = signal<any>(null);

    isLoading = signal(false);
    meta = signal({ page: 1, lastPage: 1, total: 0 });
    searchTerm = signal<string>("");

    private destroy$ = new Subject<void>();
    private searchSubject = new Subject<string>();

    ngOnInit() {
        this.setupSearchSubscription();
        this.loadData();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupSearchSubscription() {
        this.searchSubject.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(term => {
            this.searchTerm.set(term);
            this.loadData(1);
        });
    }

    onSearchChange(term: string) {
        this.searchSubject.next(term);
    }

    switchTab(tab: "inventory" | "overdue") {
        this.activeTab.set(tab);
        this.searchTerm.set("");
        this.loadData(1);
    }

    loadData(page: number = 1) {
        this.isLoading.set(true);

        if (this.activeTab() === "inventory") {
            const query: FindBooksQuery = {
                page: page,
                limit: 10,
                title: this.searchTerm(),
            };

            this.bookService.getBooks(query).subscribe({
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
                    console.error("Erro reservas:", err);
                    this.isLoading.set(false);
                },
            });
        }
    }

    handleEditBook(book: any) {
        this.selectedBook.set(book);

        this.showCreateModal.set(true);
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
            },
            error: err => {
                console.error("Erro ao criar livro:", err);
                alert("Erro ao criar livro.");
                this.isLoading.set(false);
            },
        });
    }

    handleDeleteBook(bookId: string) {
        if (!confirm("Tem certeza que deseja excluir este livro permanentemente?")) return;
        this.isLoading.set(true);
        this.adminService.deleteUser(bookId).subscribe({
            next: () => {
                alert("Livro excluído.");
                this.loadData(1);
            },
            error: () => {
                alert("Erro ao excluir.");
                this.isLoading.set(false);
            },
        });
    }

    //settings

    selectedBookForSettings = signal<any>(null);

    openSettings(book: any) {
        this.selectedBookForSettings.set(book);
    }

    closeSettings() {
        this.selectedBookForSettings.set(null);
    }

    handleRefresh() {
        this.loadData(this.meta().page);
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
}
