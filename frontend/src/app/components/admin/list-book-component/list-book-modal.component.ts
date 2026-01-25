import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
// import { ClickOutsideDirective } from "../../../core/directives/click-outside.directive";

@Component({
    selector: "app-book-list",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./list-book.component.html",
})
export class BookListComponent {
    @Input() books: any[] = [];

    @Output() addCopy = new EventEmitter<string>();
    @Output() removeCopy = new EventEmitter<string>();
    @Output() deleteBook = new EventEmitter<string>();

    activeMenuId = signal<string | null>(null);

    toggleMenu(bookId: string) {
        if (this.activeMenuId() === bookId) {
            this.activeMenuId.set(null);
        } else {
            this.activeMenuId.set(bookId);
        }
    }

    handleAction(action: "add" | "remove" | "delete", id: string) {
        this.activeMenuId.set(null);
        if (action === "add") this.addCopy.emit(id);
        if (action === "remove") this.removeCopy.emit(id);
        if (action === "delete") this.deleteBook.emit(id);
    }
}
