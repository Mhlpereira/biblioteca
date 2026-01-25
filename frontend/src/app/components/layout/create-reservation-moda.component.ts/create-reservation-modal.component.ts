import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Book } from "../../../core/model/book.models";

@Component({
    selector: "app-create-reservation-modal",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './create-reservation-modal.component.html'
})
export class CreateReservationModalComponent implements OnInit {
    private fb = inject(FormBuilder);

    @Input({ required: true }) book!: Book;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();

    form = this.fb.group({
        clientId: ["", Validators.required],
        dueDate: ["", Validators.required],
    });

    ngOnInit() {
        const date = new Date();
        date.setDate(date.getDate() + 7);

        const defaultDate = date.toISOString().split("T")[0];

        this.form.patchValue({
            dueDate: defaultDate,
        });
    }

    submit() {
        if (this.form.valid) {
            const payload = {
                bookId: this.book.id,
                clientId: this.form.value.clientId,
                dueDate: this.form.value.dueDate,
            };
            this.save.emit(payload);
        }
    }
}
