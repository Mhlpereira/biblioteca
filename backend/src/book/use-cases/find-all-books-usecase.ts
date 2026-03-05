import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { FindAllBooksInput } from '../in/find-all-books-input';
import { FindAllBooksOutput } from '../out/finda-all-books-output';
import { IBookRepository } from '../ports/i-book-repository';

@Injectable()
export class FindAllBooksUseCase {
  constructor(
    @Inject('IBookRepository')
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(input: FindAllBooksInput): Promise<PaginatedResponseDto<FindAllBooksOutput>> {
    const page = Number(input.page) || 1;
    const limit = Number(input.limit) || 10;

    return this.bookRepository.findAll({
      page,
      limit,
      title: input.title,
      author: input.author,
      onlyAvailable: input.onlyAvailable,
      imageUrl: input.imageUrl,
    });
  }
}