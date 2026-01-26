import { Component, OnInit, signal, inject, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReservationService } from "../../../services/reservation.service";
import { Reservation } from "../../../core/model/reservation.model";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AdminService } from "../../../services/admin.service";

type FilterType = 'all' | 'active' | 'overdue' | 'returned';

@Component({
    selector: "app-reservation-dashboard",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: "./reservation-dashboard.component.html",
})
export class ReservationDashboardComponent implements OnInit {
    private reservationService = inject(ReservationService);
    private adminService = inject(AdminService);
    private fb = inject(FormBuilder);
    
    Math = Math;

    reservations = signal<Reservation[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);
    showCreateForm = signal(false);
    
    currentPage = signal(1);
    totalPages = signal(1);
    total = signal(0);
    
    activeFilter = signal<FilterType>('all');

    stats = computed(() => {
        const res = this.reservations();
        return {
            total: res.length,
            active: res.filter(r => r.status !== 'RETURNED').length,
            overdue: res.filter(r => this.getDaysOverdue(r.dueDate) > 0).length,
            returned: res.filter(r => r.status === 'RETURNED').length,
        };
    });

    testForm = this.fb.group({
        bookId: ["", Validators.required],
        clientId: ["", Validators.required],
        dueDate: ["", Validators.required],
    });

    ngOnInit() {
        this.loadReservations();
    }

    loadReservations() {
        this.loading.set(true);
        this.error.set(null);
        
        const filter = this.activeFilter();
        let params: any = {
            page: this.currentPage(),
            limit: 10
        };

        if (filter === 'overdue') {
            params.overdueOnly = true;
        } else if (filter === 'active') {
            params.status = 'ACTIVE';
        } else if (filter === 'returned') {
            params.status = 'RETURNED';
        }

        this.adminService.getReservations(params.overdueOnly || false, params.page).subscribe({
            next: (res) => {
                this.reservations.set(res.data);
                this.total.set(res.meta.total);
                this.totalPages.set(res.meta.lastPage);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Erro ao carregar reservas');
                this.loading.set(false);
                console.error(err);
            }
        });
    }

    setFilter(filter: FilterType) {
        this.activeFilter.set(filter);
        this.currentPage.set(1);
        this.loadReservations();
    }

    nextPage() {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update(p => p + 1);
            this.loadReservations();
        }
    }

    previousPage() {
        if (this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
            this.loadReservations();
        }
    }

    createTestReservation() {
        if (this.testForm.invalid) return;

        const data = this.testForm.value;
        this.reservationService.create(data as any).subscribe({
            next: () => {
                this.showCreateForm.set(false);
                this.testForm.reset();
                this.loadReservations();
            },
            error: (err) => {
                this.error.set(err.error?.message || 'Erro ao criar reserva');
            },
        });
    }

    getDaysOverdue(dueDate: string | Date): number {
        const due = new Date(dueDate);
        const now = new Date();
        const diff = now.getTime() - due.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
}