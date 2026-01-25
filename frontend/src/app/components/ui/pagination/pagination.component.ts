import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-pagination",
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pagination.component.html',
})
export class PaginationComponent {
    @Input({ required: true }) currentPage = 1;
    @Input({ required: true }) lastPage = 1;
    @Input({ required: true }) total = 0;

    @Output() pageChange = new EventEmitter<number>();

    onPageChange(page: number) {
        if (page >= 1 && page <= this.lastPage) {
            this.pageChange.emit(page);
        }
    }
}
