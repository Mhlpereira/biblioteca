import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";

export interface CreateBook {
    title: string;
    author: string;
    quantity: number;
    imageUrl: string;
}

@Component({
    selector: "app-create-book-modal",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: "./create-book-modal.component.html",
})
export class CreateBookModalComponent implements OnChanges {
    private fb = inject(FormBuilder);

    @Input() book: CreateBook | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<CreateBook>(); 

    form = this.fb.group({
        title: ["", Validators.required],
        author: ["", Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]], 
        imageUrl: [""]
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["book"] && this.book) {
            this.form.patchValue({
                title: this.book.title,
                author: this.book.author,
                quantity: this.book.quantity,
                imageUrl: this.book.imageUrl
            });
        } else {
            this.form.reset({ 
                title: "",
                author: "",
                imageUrl: "",
                quantity: 1 
            });
        }
    }

    submit() {
        if (this.form.valid) {
            const formData = this.form.value as unknown as CreateBook;
            this.save.emit(formData);
        }
    }
}