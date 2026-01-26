import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { AuthService } from "../../../services/auth.service";
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
    private authService = inject(AuthService);

    @Input({ required: true }) book!: Book;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();

    form = this.fb.group({
        dueDate: ["", Validators.required],
    });

    userId: string | null = null;

    ngOnInit() {
        this.authService.getProfile().subscribe(user => {
            this.userId = user.id;
        });

        const date = new Date();
        date.setDate(date.getDate() + 7);
        this.form.patchValue({ dueDate: date.toISOString().split("T")[0] });
    }

    submit() {
        if (this.form.valid && this.userId) {
            const payload = {
                bookId: this.book.id,
                clientId: this.userId,
                dueDate: this.form.value.dueDate,
            };
            this.save.emit(payload);
        }
    }
}
