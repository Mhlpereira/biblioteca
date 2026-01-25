import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Book, FindBooksQuery } from '../../../core/model/book.models';
import { BookService } from '../../../services/book.service';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catalog.page.html',
})
export class CatalogPage {
  private bookService = inject(BookService);
  private fb = inject(FormBuilder);

  books: Book[] = [];
  isLoading = false;
  hasSearched = false; 

  searchForm = this.fb.group({
    title: [''],
    author: [''],
    onlyAvailable: [false] 
  });

  ngOnInit() {
    this.searchBooks();
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
      next: (results) => {
        this.books = results;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar livros', err);
        this.isLoading = false;
      }
    });
  }

  private removeEmptyFields(obj: any): any {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null && v !== ''));
  }
}