import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Reservation } from "../../../core/model/reservation.model";
import { PaginationComponent } from "../../ui/pagination/pagination.component";
import { AdminService } from "../../../services/admin.service";

@Component({
    selector: "app-reservation-list",
    standalone: true,
    imports: [CommonModule, PaginationComponent],
    templateUrl: "./list-reservations.component.html",
})
export class ReservationListComponent implements OnInit {
    private adminService = inject(AdminService);

    reservations = signal<Reservation[]>([]);
    isLoading = signal(false);
    showOverdueOnly = signal(false);

    meta = signal({ page: 1, lastPage: 1, total: 0 });

    ngOnInit() {
        this.loadReservations();
    }

    toggleOverdue() {
        this.showOverdueOnly.update(v => !v);
        this.loadReservations(1); 
    }

    loadReservations(page: number = 1) {
        this.isLoading.set(true);
        this.adminService.getReservations(this.showOverdueOnly(), page).subscribe({
            next: res => {
                this.reservations.set(res.data);
                this.meta.set(res.meta);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false),
        });
    }

    getStatusClass(status: string) {
        const base = "px-2 py-1 rounded-full text-xs font-bold ";
        switch (status) {
            case "ACTIVE":
                return base + "bg-blue-100 text-blue-700";
            case "OVERDUE":
                return base + "bg-red-100 text-red-700";
            case "RETURNED":
                return base + "bg-green-100 text-green-700";
            default:
                return base + "bg-slate-100 text-slate-700";
        }
    }
}
