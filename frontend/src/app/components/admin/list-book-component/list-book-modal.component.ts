import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-book-list",
    standalone: true,
    imports: [CommonModule], 
    templateUrl: "./list-book-modal.component.html",
})
export class BookListComponent {
    @Input() books: any[] = [];

    @Output() addCopy = new EventEmitter<string>();
    @Output() removeCopy = new EventEmitter<string>();
    @Output() deleteBook = new EventEmitter<string>();

    @Output() settings = new EventEmitter<any>();
    @Output() editBook = new EventEmitter<any>();

    activeMenuId = signal<string | null>(null);

    toggleMenu(bookId: string) {
        this.activeMenuId.update(current => (current === bookId ? null : bookId));
    }

    handleAction(action: string, id: string) {
        this.activeMenuId.set(null);
        if (action === "add") this.addCopy.emit(id);
        if (action === "remove") this.removeCopy.emit(id);
        if (action === "delete") this.deleteBook.emit(id);
    }

    onSettingsClick(book: any) {
        console.log("cliquei")
        this.activeMenuId.set(null);
        this.settings.emit(book);
    }

    onEditClick(book: any) {
        console.log("1. Filho: Cliquei em editar", book);
        this.activeMenuId.set(null);
        this.editBook.emit(book);
    }

}
