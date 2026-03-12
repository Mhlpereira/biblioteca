import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Book } from "../../../core/model/book.models";

@Component({
    selector: "app-create-reservation-modal",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: "./create-reservation-modal.component.html",
})
export class CreateReservationModalComponent implements OnInit {
    private fb = inject(FormBuilder);

    @Input({ required: true }) book!: Book;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();

    form = this.fb.group({
        dueDate: ["", Validators.required],
    });

    ngOnInit() {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        this.form.patchValue({ dueDate: date.toISOString().split("T")[0] });
    }

    submit() {
        if (this.form.valid) {
            const rawDueDate = this.form.value.dueDate;
            const dueDate = rawDueDate ? new Date(`${rawDueDate}T00:00:00`).toISOString() : undefined;

            const payload = {
                bookId: this.book.id,
                dueDate,
            };
            this.save.emit(payload);
        }
    }
}
