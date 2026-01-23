import { Injectable } from "@nestjs/common";
import { UpdateBookCopyDto } from "./dto/update-book-copy.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { BookCopy } from "./entities/book-copy.entity";
import { Repository } from "typeorm";
import { ulid } from "ulid";
import { BookCopyStatus } from "./enum/book-status.enum";
import { Book } from "../book/entities/book.entity";

@Injectable()
export class BookCopyService {
    constructor(
        @InjectRepository(BookCopy)
        private readonly bookCopyRepository: Repository<BookCopy>
    ) {}

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

    findAll() {
        return `This action returns all bookCopy`;
    }

    findOne(id: number) {
        return `This action returns a #${id} bookCopy`;
    }

    update(id: number, updateBookCopyDto: UpdateBookCopyDto) {
        return `This action updates a #${id} bookCopy`;
    }

    remove(id: number) {
        return `This action removes a #${id} bookCopy`;
    }
}
