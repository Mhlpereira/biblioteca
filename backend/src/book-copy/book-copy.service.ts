import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BookCopy } from "./entities/book-copy.entity";
import { Repository } from "typeorm";
import { ulid } from "ulid";
import { BookCopyStatus } from "./enum/book-status.enum";
import { Book } from "../book/entities/book.entity";
import { AddBookCopyInput } from "./interface/add-copy.interface";
import { RemoveCopy } from "./interface/remove-copy.interface";

@Injectable()
export class BookCopyService {
    constructor(
        @InjectRepository(BookCopy)
        private readonly bookCopyRepository: Repository<BookCopy>,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>
    ) {}

    async addCopyFromDto(data: AddBookCopyInput) {
        const book = await this.bookRepository.findOneBy({ id: data.bookId });
        if (!book) {
            throw new NotFoundException("Livro não existe");
        }

        return await this.addCopies(book, data.quantity);
    }

    async addCopies(book: Book, quantity: number) {
        const copies = Array.from({ length: quantity }).map(() =>
            this.bookCopyRepository.create({
                id: ulid(),
                book,
                status: BookCopyStatus.AVAILABLE,
            })
        );

        await this.bookCopyRepository.save(copies);

        return copies;
    }

    async removeCopy(removeCopy: RemoveCopy) {
        const copy = await this.bookCopyRepository.findOne({
            where: { id: removeCopy.copyId },
            relations: ["book"],
        });

        if (!copy) {
            throw new NotFoundException("Cópia do livro não encontrada");
        }

        if (copy.status !== BookCopyStatus.AVAILABLE) {
            throw new BadRequestException(`Não é possível remover a cópia. Status atual: ${copy.status}`);
        }

        copy.status = BookCopyStatus.REMOVED;
        await this.bookCopyRepository.save(copy);

        return {
            message: "Cópia removida com sucesso",
            copyId: copy.id,
            bookTitle: copy.book?.title,
        };
    }


    async findAvailableCopyByBookId(bookId: string) {
        const copyId = await this.bookCopyRepository.findOne({
            where: {
                book: { id: bookId }, 
                status: BookCopyStatus.AVAILABLE
            },
        });

        if(!copyId){
            throw new NotFoundException("Sem livros disponiveis");
        }

        return copyId;
    }
}
