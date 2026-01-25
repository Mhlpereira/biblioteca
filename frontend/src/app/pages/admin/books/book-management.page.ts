import { Component, inject, OnInit, signal } from "@angular/core";
import { PaginationComponent } from "../../../components/ui/pagination/pagination.component";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { AdminService } from "../../../services/admin.service";

@Component({
    selector: "app-book-management",
    standalone: true,
    imports: [CommonModule, PaginationComponent, DatePipe, CurrencyPipe],
    templateUrl: "./book-management.page.html",
})
export class BookManagementPage implements OnInit {
    private adminService = inject(AdminService);

    activeTab = signal<"inventory" | "overdue">("inventory");
    books = signal<any[]>([]);
    overdueReservations = signal<any[]>([]);

    isLoading = signal(false);
    meta = signal({ page: 1, lastPage: 1, total: 0 });

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
            this.adminService.getBooks(page).subscribe(res => this.handleResponse(res));
        } else {
            this.adminService.getReservations(true, page).subscribe(res => this.handleResponse(res));
        }
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
