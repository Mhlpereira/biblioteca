import { Book } from "../../book/entities/book.entity";
import { BookCopy } from "../entities/book-copy.entity";


export interface IBookCopyRepository {
  addCopies(book: Book, quantity: number): Promise<BookCopy[]>;
}