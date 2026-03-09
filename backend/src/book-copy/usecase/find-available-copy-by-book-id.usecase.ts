import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BookCopyRepositoryOutPort } from "../ports/book-copy-out.port";
import { FindAvailableCopyInput } from "../ports/in/find-available-copy.in";
import { FindAvailableCopyOutput } from "../ports/out/find-available-copy.ou";

@Injectable()
export class FindAvailableCopyByBookIdUseCase {
    constructor(
        @Inject("BookCopyRepositoryOutPort")
        private readonly bookCopyRepository: BookCopyRepositoryOutPort
    ) {}

    async execute(input: FindAvailableCopyInput): Promise<FindAvailableCopyOutput> {
        const copy = await this.bookCopyRepository.findAvailableByBookId(input.bookId);

        if (!copy) {
            throw new NotFoundException("Sem livros disponíveis");
        }

        return {
            id: copy.id,
            bookTitle: copy.book?.title || "",
            status: copy.status,
            bookId: input.bookId,
        };
    }
}
