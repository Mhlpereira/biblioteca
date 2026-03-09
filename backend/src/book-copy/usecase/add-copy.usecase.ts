import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AddBookCopyInput } from "../ports/in/add-copy.in";
import { BookRepositoryOutPort } from "../../book/ports/book-repository-out.port";
import { BookCopyRepositoryOutPort } from "../ports/book-copy-out.port";
import { AddCopyOutput } from "../ports/out/add-copy.out";

@Injectable()
export class AddCopyUseCase {
    constructor(
        @Inject("BookCopyRepositoryOutPort")
        private readonly bookRepository: BookRepositoryOutPort,

        @Inject("BookCopyRepositoryOutPort")
        private readonly bookCopyRepository: BookCopyRepositoryOutPort
    ) {}

    async execute(input: AddBookCopyInput): Promise<AddCopyOutput[]> {
        const book = await this.bookRepository.findById(input.bookId);

        if (!book) {
            throw new NotFoundException("Livro não existe");
        }

        const copies = await this.bookCopyRepository.addCopies(book, input.quantity);

        return copies.map(copy => ({
            id: copy.id,
            status: copy.status,
            bookId: book.id,
        }));
    }
}
