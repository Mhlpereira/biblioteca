import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateBookDto } from "./dto/book-create.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { Repository } from "typeorm";
import { Book } from "./entities/book.entity";
import { CreateBook } from "./interface/create-book.interface";
import { CreateBookResponse } from "./interface/create-book-response.interface";
import { ulid } from "ulid";
import { BookCopy } from "../book-copy/entities/book-copy.entity";
import { BookCopyStatus } from "../book-copy/enum/book-status.enum";
import { AddBookCopyInput } from "./interface/add-copy.interface";

@Injectable()
export class BookService {
    constructor(
        private readonly bookRepository: Repository<Book>,
        private readonly bookCopyRepository: Repository<BookCopy>
    ) {}

    async createBook(data: CreateBook): Promise<CreateBookResponse> {
        const book = this.bookRepository.create({ id: ulid(), ...data });

        await this.bookRepository.save(book);

        const copies = Array.from({ length: data.totalCopies }).map(() =>
            this.bookCopyRepository.create({
                id: ulid(),
                book,
                status: BookCopyStatus.AVAILABLE,
            })
        );

        await this.bookCopyRepository.save(copies);

        return {
            id: book.id,
            title: book.title,
            author: book.author,
            totalCopies: book.totalCopies,
        };
    }

    async addCopy(data: AddBookCopyInput) {
        const book = await this.findBookById(data.bookId);

        const copies = Array.from({ length: data.quantity }).map(() =>
            this.bookCopyRepository.create({
                id: ulid(),
                book,
                status: BookCopyStatus.AVAILABLE,
            })
        );

        await this.bookCopyRepository.save(copies);

        book.totalCopies += data.quantity;
        await this.bookRepository.save(book);
    }

    async findBookById(id: string): Promise<Book> {
        const book = await this.bookRepository.findOneBy({ id });

        if (!book) {
            throw new NotFoundException("Livro não encontrado");
        }

        return book;
    }

    findAll() {
        return `This action returns all book`;
    }

    findOne(id: number) {
        return `This action returns a #${id} book`;
    }

    update(id: number, updateBookDto: UpdateBookDto) {
        return `This action updates a #${id} book`;
    }

    remove(id: number) {
        return `This action removes a #${id} book`;
    }
}
