import { Component, inject, OnInit, ChangeDetectorRef, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Book, FindBooksQuery } from "../../../core/model/book.models";
import { BookService } from "../../../services/book.service";
import { ReservationService } from "../../../services/reservation.service";
import { CreateReservationModalComponent } from "../../../components/layout/create-reservation-moda.component.ts/create-reservation-modal.component";
import { CreateReservation } from "../../../core/model/reservation.model";

@Component({
    selector: "app-catalog-page",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, CreateReservationModalComponent],
    templateUrl: "./catalog.page.html",
})
export class CatalogPage implements OnInit {
    private bookService = inject(BookService);
    private reservationService = inject(ReservationService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    books: Book[] = [];
    isLoading = false;

    selectedBook = signal<Book | null>(null);

    searchForm = this.fb.group({
        title: [""],
        author: [""],
        onlyAvailable: [false],
    });

    ngOnInit() {
        this.onSearch();
    }

    openReservationModal(book: Book) {
        this.selectedBook.set(book);
    }

    closeReservationModal() {
        this.selectedBook.set(null);
    }

    handleCreateReservation(reservationData: CreateReservation) {
        if (!confirm("Confirmar reserva?")) return;

        this.isLoading = true;

        this.reservationService.create(reservationData).subscribe({
            next: () => {
                alert("Reserva realizada com sucesso!");
                this.closeReservationModal();
                this.isLoading = false;
                this.onSearch();
            },
            error: err => {
                console.error(err);
                alert("Erro ao realizar reserva.");
                this.isLoading = false;
            },
        });
    }
    onSearch() {
        const query = this.searchForm.value as FindBooksQuery;
        this.searchBooks(query);
    }

    private searchBooks(query?: FindBooksQuery) {
        this.isLoading = true;
        const cleanQuery = query ? this.removeEmptyFields(query) : {};

        this.bookService.getBooks(cleanQuery).subscribe({
            next: response => {
                this.books = [...response.data];
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: err => {
                console.error("Erro ao buscar livros", err);
                this.isLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    private removeEmptyFields(obj: any): any {
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null && v !== ""));
    }
}
