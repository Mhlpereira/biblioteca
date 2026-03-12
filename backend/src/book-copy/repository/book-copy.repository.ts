import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ulid } from 'ulid';
import { Book } from '../../book/entities/book.entity';
import { PaginatedResult } from '../../common/interfaces/paginated.interface';
import { BookCopy } from '../entities/book-copy.entity';
import { BookCopyStatus } from '../enum/book-status.enum';
import { BookCopyRepositoryOutPort } from '../ports/book-copy-out.port';



@Injectable()
export class BookCopyRepository implements BookCopyRepositoryOutPort {
  constructor(
    @InjectRepository(BookCopy)
    private readonly repository: Repository<BookCopy>,
  ) {}

  async addCopies(book: Book, quantity: number): Promise<BookCopy[]> {
    const copies = Array.from({ length: quantity }).map(() =>
      this.repository.create({
        id: ulid(),
        book,
        status: BookCopyStatus.AVAILABLE,
      }),
    );

    return this.repository.save(copies);
  }

  async findByIdWithBook(copyId: string): Promise<BookCopy | null> {
    return this.repository.findOne({
      where: { id: copyId },
      relations: ['book'],
    });
  }

  async findAvailableByBookId(bookId: string): Promise<BookCopy | null> {
    return this.repository.findOne({
      where: {
        book: { id: bookId },
        status: BookCopyStatus.AVAILABLE,
      },
      relations: ['book'],
    });
  }

  async updateStatus(copyId: string, status: BookCopyStatus): Promise<void> {
    await this.repository.update({ id: copyId }, { status });
  }

  async findAllByBook(bookId: string): Promise<PaginatedResult<BookCopy>> {
    const [data, total] = await this.repository.findAndCount({
      where: {
        book: { id: bookId },
      },
      relations: {
        book: true,
      },
    });

    return {
      data,
      meta: {
        total,
        page: 1,
        lastPage: 1,
      },
    };
  }
}