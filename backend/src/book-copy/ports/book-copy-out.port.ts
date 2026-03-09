import { Book } from '../../book/entities/book.entity';
import { PaginatedResult } from '../../common/interfaces/paginated.interface';
import { BookCopy } from '../entities/book-copy.entity';
import { BookCopyStatus } from '../enum/book-status.enum';

export interface BookCopyRepositoryOutPort {
  addCopies(book: Book, quantity: number): Promise<BookCopy[]>;        
  findByIdWithBook(copyId: string): Promise<BookCopy | null>;
  findAvailableByBookId(bookId: string): Promise<BookCopy | null>;
  updateStatus(copyId: string, status: BookCopyStatus): Promise<void>; 
  findAllByBook(bookId: string): Promise<PaginatedResult<BookCopy>>;
}