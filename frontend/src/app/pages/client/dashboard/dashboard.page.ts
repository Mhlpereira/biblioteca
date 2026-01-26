import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { UserStore } from "../../../core/stores/user.store";
import { Reservation } from "../../../core/model/reservation.model";
import { ReservationService } from "../../../services/reservation.service";
import { PaginatedResult } from "../../../core/model/pagination.model";

@Component({
    selector: "app-client-dashboard",
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: "./dashboard.page.html",
})
export class DashboardPage implements OnInit {
    private reservationService = inject(ReservationService);
    public userStore = inject(UserStore);
    
    reservations: Reservation[] = [];
    isLoading = true;
    returningBookId: string | null = null;
    page = 1;
    limit = 9;
    total = 0;
    lastPage = 1;
    filterStatus: 'ACTIVE' | 'RETURNED' | 'ALL' = 'ACTIVE';

    ngOnInit() {
        this.fetchReservations(1);
    }

    setFilter(status: 'ACTIVE' | 'RETURNED' | 'ALL') {
        this.filterStatus = status;
    }

    getActiveCount(): number {
        return this.reservations.filter(r => r.status !== 'RETURNED').length;
    }

    getReturnedCount(): number {
        return this.reservations.filter(r => r.status === 'RETURNED').length;
    }

    getFilteredReservations(): Reservation[] {
        if (this.filterStatus === 'ALL') return this.reservations;
        if (this.filterStatus === 'RETURNED') {
            return this.reservations.filter(r => r.status === 'RETURNED');
        }
        return this.reservations.filter(r => r.status !== 'RETURNED');
    }

    fetchReservations(page = this.page) {
        this.isLoading = true;
        this.reservationService.getMyReservations(page, this.limit).subscribe({
            next: (res: PaginatedResult<Reservation>) => {
                this.reservations = res.data;
                this.total = res.meta.total;
                this.page = res.meta.page;
                this.lastPage = res.meta.lastPage;
                this.isLoading = false;
            },
            error: err => {
                console.error("Erro ao buscar reservas", err);
                this.isLoading = false;
            },
        });
    }

    nextPage() {
        if (this.page < this.lastPage) this.fetchReservations(this.page + 1);
    }

    prevPage() {
        if (this.page > 1) this.fetchReservations(this.page - 1);
    }

    onReturnBook(reservationId: string) {
        if (!confirm("Confirmar a devolução deste livro?")) return;
        
        this.returningBookId = reservationId;
        this.reservationService.returnBook(reservationId).subscribe({
            next: () => {
                this.returningBookId = null;
                alert("Livro devolvido com sucesso!");
                this.fetchReservations(this.page);
            },
            error: err => {
                console.error(err);
                this.returningBookId = null;
                alert("Erro ao devolver livro. Tente novamente.");
            },
        });
    }
}