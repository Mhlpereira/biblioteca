import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { AdminService } from "../../../services/admin.service";
import { PaginationComponent } from "../../../components/ui/pagination/pagination.component";
import { ReservationService } from "../../../services/reservation.service";

@Component({
    selector: "app-overdue-list",
    standalone: true,
    imports: [CommonModule, PaginationComponent],
    templateUrl: './list-overdue-modal.component.html'
})
export class OverdueListComponent implements OnInit {
    private adminService = inject(AdminService);
    private reservationService = inject(ReservationService);

    reservations = signal<any[]>([]);
    meta = signal({ page: 1, lastPage: 1, total: 0 });
    isLoading = signal(false);

    ngOnInit() {
        this.loadData(1);
    }

    loadData(page: number) {
        this.isLoading.set(true);
        this.adminService.getReservations(true, page).subscribe({
            next: res => {
                this.reservations.set(res.data);
                this.meta.set(res.meta);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false),
        });
    }
}
