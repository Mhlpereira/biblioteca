import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Book } from "../entities/book.entity";
import { PaginatedResponseDto } from "../../common/dto/pagination-response.dto";
import { BookFilters } from "../interface/book-filters";
import { FindAllBooksOutput } from "../ports/out/find-all-books-output";
import { BookCopyStatus } from "../../book-copy/enum/book-status.enum";
import { BookRepositoryOutPort } from "../ports/book-repository-out.port";

@Injectable()
export class BookRepository implements BookRepositoryOutPort {
    constructor(
        @InjectRepository(Book)
        private readonly repository: Repository<Book>
    ) {}

    async create(data: Partial<Book>): Promise<Book> {
        const book = this.repository.create(data);
        return this.repository.save(book);
    }

    async findById(id: string): Promise<Book | null> {
        return this.repository.findOneBy({ id });
    }

    async update(book: Book): Promise<Book> {
        return this.repository.save(book);
    }

    async findAll(filters: BookFilters): Promise<PaginatedResponseDto<FindAllBooksOutput>> {
        const { page, limit, title, author, onlyAvailable } = filters;
        const skip = (page - 1) * limit;

        const AVAILABLE_SUM = `
      SUM(
        CASE 
          WHEN copy.status = :available THEN 1 
          ELSE 0 
        END
      )
    `;

        const qb = this.repository
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

        if (title) {
            qb.andWhere("LOWER(book.title) LIKE LOWER(:title)", { title: `%${title}%` });
        }

        if (author) {
            qb.andWhere("LOWER(book.author) LIKE LOWER(:author)", { author: `%${author}%` });
        }

        if (onlyAvailable) {
            qb.having(`${AVAILABLE_SUM} > 0`).setParameter("available", BookCopyStatus.AVAILABLE);
        }

        const total = await qb
            .clone()
            .getRawMany()
            .then(r => r.length);

        const raw = await qb.limit(limit).offset(skip).getRawMany();

        const data: FindAllBooksOutput[] = raw.map(r => ({
            id: r.id,
            title: r.title,
            author: r.author,
            imageUrl: r.imageurl ?? "",
            totalCopies: Number(r.totalcopies ?? 0),
            availableCopies: Number(r.availablecopies ?? 0),
            hasAvailable: Number(r.availablecopies ?? 0) > 0,
        }));

        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
}
