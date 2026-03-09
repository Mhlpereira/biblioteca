import { Inject, Injectable } from "@nestjs/common";
import { BookCopyRepositoryOutPort } from "../ports/book-copy-out.port";
import { PaginatedResult } from "../../common/interfaces/paginated.interface";
import { BookCopy } from "../entities/book-copy.entity";
import { FindAllByBookInput } from "../ports/in/find-all-by-book.in";
import { FindAllByBookCopyOutput } from "../ports/out/find-all-by-book.out";

@Injectable()
export class FindAllByBookUseCase {
    constructor(
        @Inject("BookCopyRepositoryOutPort")
        private readonly bookCopyRepository: BookCopyRepositoryOutPort
    ) {}

    async execute(input: FindAllByBookInput): Promise<PaginatedResult<FindAllByBookCopyOutput>> {
        const result = await this.bookCopyRepository.findAllByBook(input.bookId);

        return {
            ...result,
            data: result.data.map(copy => ({
                id: copy.id,
                status: copy.status,
                bookId: copy.book?.id,
                bookTitle: copy.book?.title,
            })),
        };
    }
}
