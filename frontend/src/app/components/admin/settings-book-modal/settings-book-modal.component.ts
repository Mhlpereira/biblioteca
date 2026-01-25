import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { AdminService } from "../../../services/admin.service";
import { AddCopy, RemoveCopy } from "../../../core/model/book.models";
import { BookService } from "../../../services/book.service";

@Component({
    selector: "app-settings-book-modal",
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: "./settings-book-modal.component.html",
})
export class SettingsBookModalComponent implements OnInit {
    private adminService = inject(AdminService);
    private bookService = inject(BookService);
    private fb = inject(FormBuilder);

    @Input({ required: true }) book: any;
    @Output() close = new EventEmitter<void>();
    @Output() refresh = new EventEmitter<void>();

    activeTab = signal<"stock" | "danger">("stock");
    copies = signal<any[]>([]);
    isLoadingCopies = signal(false);
    isProcessing = signal(false);

    addForm = this.fb.group({
        quantity: [1, [Validators.required, Validators.min(1)]],
    });

    ngOnInit() {
        this.loadCopies();
    }

    loadCopies() {
        this.isLoadingCopies.set(true);

        this.bookService.getBookCopies(this.book.id).subscribe({
            next: (res) => {
                this.copies.set(res.data);
                this.isLoadingCopies.set(false);
            },
            error: err => {
                console.error("Erro ao carregar cópias", err);
                this.isLoadingCopies.set(false);
            },
        });
    }

    onAddCopies() {
        if (this.addForm.invalid) return;

        this.isProcessing.set(true);
        const qty = this.addForm.value.quantity!;

        const dto: AddCopy = {
            bookId: this.book.id,
            quantity: qty,
        };

        this.adminService.addBookCopy(dto).subscribe({
            next: () => {
                alert(`${qty} cópia(s) adicionada(s)!`);
                this.loadCopies();
                this.refresh.emit();
                this.addForm.reset({ quantity: 1 });
                this.isProcessing.set(false);
            },
            error: err => {
                console.error(err);
                alert("Erro ao adicionar cópias.");
                this.isProcessing.set(false);
            },
        });
    }

    onRemoveCopy(bookId: string) {
        if (!confirm("Tem certeza que deseja remover esta cópia específica do sistema?")) return;

        this.isProcessing.set(true);
        const dto: RemoveCopy = { bookId };

        this.adminService.removeBookCopy(dto).subscribe({
            next: () => {
                this.loadCopies();
                this.refresh.emit();
                this.isProcessing.set(false);
            },
            error: err => {
                console.error(err);
                alert("Erro ao remover cópia. Verifique se não está emprestada.");
                this.isProcessing.set(false);
            },
        });
    }

    onDeactivate() {
        if (!confirm("ATENÇÃO: Desativar o livro impedirá novos empréstimos. Continuar?")) return;

        this.isProcessing.set(true);
        this.adminService.deactivateBook(this.book.id).subscribe({
            next: () => {
                alert("Livro desativado com sucesso.");
                this.refresh.emit();
                this.close.emit();
            },
            error: err => {
                console.error(err);
                this.isProcessing.set(false);
            },
        });
    }
}
