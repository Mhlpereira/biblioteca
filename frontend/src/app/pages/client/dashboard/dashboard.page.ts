import { Component, inject, OnInit } from "@angular/core";
import { CommonModule, DatePipe, CurrencyPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { UserStore } from "../../../core/stores/user.store";
import { Reservation } from "../../../core/model/reservation.model";
import { ReservationService } from "../../../services/reservation.service";

@Component({
    selector: "app-client-dashboard",
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
    templateUrl: "./dashboard.page.html",
})
export class DashboardPage implements OnInit {
    private reservationService = inject(ReservationService);
    public userStore = inject(UserStore);
    reservations: Reservation[] = [];
    isLoading = true;

    ngOnInit() {
        this.fetchReservations();
    }

    fetchReservations() {
        this.isLoading = true;
        this.reservationService.getMyReservations().subscribe({
            next: data => {
                this.reservations = data;
                this.isLoading = false;
            },
            error: err => {
                console.error("Erro ao buscar reservas", err);
                this.isLoading = false;
            },
        });
    }

    onReturnBook(reservationId: string) {
        if (!confirm("Confirmar a devolução deste livro?")) return;

        this.isLoading = true;
        this.reservationService.returnBook(reservationId).subscribe({
            next: () => {
                this.fetchReservations();
            },
            error: err => {
                this.isLoading = false;
                alert("Erro ao devolver livro. Tente novamente.");
            },
        });
    }

    isOverdue(reservation: Reservation): boolean {
        if (reservation.status === "RETURNED") return false;
        return new Date(reservation.dueDate) < new Date();
    }
}
