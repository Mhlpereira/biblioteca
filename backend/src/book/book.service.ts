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
import { PaginatedResult } from "../common/interfaces/paginated.interface";

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

    async findAll(filters: QueryBook): Promise<PaginatedResult<BookListResponse>> {
        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;
        const skip = (page - 1) * limit;

        const AVAILABLE_SUM = `
            SUM(
                CASE 
                    WHEN copy.status = :available THEN 1 
                    ELSE 0 
                END
            )
        `;

        const qb = this.bookRepository
            .createQueryBuilder("book")
            .leftJoin("book.copies", "copy")
            .select("book.id", "id")
            .addSelect("book.title", "title")
            .addSelect("book.author", "author")
            .addSelect("book.imageUrl", "imageurl") 
            .addSelect("COUNT(copy.id)", "totalcopies")
            .addSelect(AVAILABLE_SUM, "availablecopies")
            .where("book.active = :active", { active: true })
            .setParameter("available", BookCopyStatus.AVAILABLE)
            .groupBy("book.id");

        if (filters.title) {
            qb.andWhere("LOWER(book.title) LIKE LOWER(:title)", { title: `%${filters.title}%` });
        }

        if (filters.author) {
            qb.andWhere("LOWER(book.author) LIKE LOWER(:author)", { author: `%${filters.author}%` });
        }

        if (filters.onlyAvailable) {
            qb.having(`${AVAILABLE_SUM} > 0`);
        }

        const countQb = qb.clone();
        const totalResult = await countQb.getRawMany();
        const total = totalResult.length;


        qb.limit(limit);
        qb.offset(skip);

        const raw = await qb.getRawMany();

        const data = raw.map(r => {
            const totalCopies = Number(r.totalcopies ?? 0);
            const availableCopies = Number(r.availablecopies ?? 0);

            return {
                id: r.id,
                title: r.title,
                author: r.author,
                totalCopies,
                availableCopies,
                hasAvailable: availableCopies > 0,
                imageUrl: r.imageurl ?? "", 
            };
        });

        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
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
        const book = await this.findBookById(id);

        book.active = false;

        //adiciona lógica de reservas ativas

        await this.bookRepository.save(book);

        return book;
    }
}
