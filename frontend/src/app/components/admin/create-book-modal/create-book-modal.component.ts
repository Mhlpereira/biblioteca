import { Component, EventEmitter, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CreateBook } from "../../../core/model/book.models";

@Component({
    selector: "app-create-book-modal",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: "./create-book-modal.component.html",
})
export class CreateBookModalComponent {
    private fb = inject(FormBuilder);

    @Output() close = new EventEmitter<void>();

    @Output() save = new EventEmitter<CreateBook>();

    form = this.fb.group({
        title: ["", Validators.required],
        author: ["", Validators.required],
        quantity: [1, [Validators.min(1)]],
        imageUrl: [""],
    });

    onClose() {
        this.close.emit();
    }

    onSubmit() {
        if (this.form.valid) {
            this.save.emit(this.form.value as CreateBook);
        }
    }
}
