import { Inject, Injectable } from "@nestjs/common";
import { BookCopyRepositoryOutPort } from "../ports/book-copy-out.port";
import { BookCopyStatus } from "../enum/book-status.enum";
import { UpdateCopyStatusInput } from "../ports/in/update-copy-status.in";

@Injectable()
export class UpdateCopyStatusUseCase {
    constructor(
        @Inject("BookCopyRepositoryOutPort")
        private readonly bookCopyRepository: BookCopyRepositoryOutPort
    ) {}

    async execute(input: UpdateCopyStatusInput): Promise<void> {
        await this.bookCopyRepository.updateStatus(input.copyId, input.status as BookCopyStatus);
    }
}
