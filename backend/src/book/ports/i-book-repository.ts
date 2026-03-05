import { PaginatedResponseDto } from "../../common/dto/pagination-response.dto";
import { Book } from "../entities/book.entity";
import { BookFilters } from "../interface/book-filters";
import { FindAllBooksOutput } from "../out/finda-all-books-output";

export interface IBookRepository {
  create(data: Partial<Book>): Promise<Book>;
  findById(id: string): Promise<Book | null>;
  findAll(filters: BookFilters): Promise<PaginatedResponseDto<FindAllBooksOutput>>;
  update(book: Book): Promise<Book>;
}