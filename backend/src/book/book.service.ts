import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Book } from "./entities/book.entity";
import { CreateBook } from "./interface/create-book.interface";
import { CreateBookResponse } from "./interface/create-book-response.interface";
import { ulid } from "ulid";
import { BookCopyService } from "../book-copy/book-copy.service";
import { QueryBook } from "./interface/query-book.interface";
import { BookCopyStatus } from "../book-copy/enum/book-status.enum";
import { BookListResponse } from "./interface/list-book-response.interface";
import { UpdateBook } from "./interface/update-book.interface";

@Injectable()
export class BookService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
        private readonly bookCopyRepository: BookCopyService
    ) {}

    async createBook(data: CreateBook): Promise<CreateBookResponse> {
        const book = this.bookRepository.create({ id: ulid(), ...data });

        await this.bookRepository.save(book);

        const copies = await this.bookCopyRepository.addCopies(book, data.quantity);

        return {
            id: book.id,
            title: book.title,
            author: book.author,
            copies: copies.length,
        };
    }

    async findBookById(id: string): Promise<Book> {
        const book = await this.bookRepository.findOneBy({ id });

        if (!book) {
            throw new NotFoundException("Livro não encontrado");
        }

        return book;
    }

    async findAll(filters: QueryBook): Promise<BookListResponse[]> {
        const qb = this.bookRepository
            .createQueryBuilder("book")
            .leftJoin("book.copies", "copy")
            .select([
                "book.id AS id",
                "book.title AS title",
                "book.author AS author",
                "COUNT(copy.id) AS totalCopies",
                `
            SUM(
                CASE 
                    WHEN copy.status = :available THEN 1 
                    ELSE 0 
                END
            ) AS availableCopies
            `,
            ])
            .where("book.active = true")
            .setParameter("available", BookCopyStatus.AVAILABLE)
            .groupBy("book.id");

        if (filters.title) {
            qb.andWhere("book.title ILIKE :title", { title: `%${filters.title}%` });
        }

        if (filters.author) {
            qb.andWhere("book.author ILIKE :author", { author: `%${filters.author}%` });
        }

        if (filters.onlyAvailable === true) {
            qb.having("availableCopies > 0");
        }

        const raw = await qb.getRawMany();

        return raw.map(r => ({
            id: r.id,
            title: r.title,
            author: r.author,
            totalCopies: Number(r.totalcopies),
            availableCopies: Number(r.availablecopies),
            hasAvailable: Number(r.availablecopies) > 0,
            imageUrl: r.imageurl || '',
        }));
    }

    async update(id: string, updateBook: UpdateBook) {
        const book = await this.findBookById(id);

        if (updateBook.title !== undefined) {
            book.title = updateBook.title;
        }

        if (updateBook.author !== undefined) {
            book.author = updateBook.author;
        }

        return this.bookRepository.save(book);
    }

    async deactivate(id: string) {
        const book = await this.findBookById(id)

        book.active = false;

        //adiciona lógica de reservas ativas
        
        await this.bookRepository.save(book);

        return book;
    }
}
