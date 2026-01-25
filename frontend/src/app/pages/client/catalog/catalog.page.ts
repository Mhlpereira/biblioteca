import { Component, inject, OnInit, ChangeDetectorRef } from "@angular/core"; 
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Book, FindBooksQuery } from "../../../core/model/book.models";
import { BookService } from "../../../services/book.service";

@Component({
    selector: "app-catalog-page",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: "./catalog.page.html",
})
export class CatalogPage implements OnInit {
    private bookService = inject(BookService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef); 

    books: Book[] = [];
    isLoading = false;
    hasSearched = false;

    searchForm = this.fb.group({
        title: [""],
        author: [""],
        onlyAvailable: [false],
    });

    ngOnInit() {
        this.onSearch();
    }

    onSearch() {
        this.hasSearched = true;
        const query = this.searchForm.value as FindBooksQuery;
        this.searchBooks(query);
    }

    private searchBooks(query?: FindBooksQuery) {
        this.isLoading = true;
        const cleanQuery = query ? this.removeEmptyFields(query) : {};

        this.bookService.getBooks(cleanQuery).subscribe({
            next: response => {
                console.log("Recebendo dados:", response.data);

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