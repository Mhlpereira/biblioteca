import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { FindAllBooksInput } from '../ports/in/find-all-books-input';
import { FindAllBooksOutput } from '../ports/out/find-all-books-output';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';

@Injectable()
export class FindAllBooksUseCase {
  constructor(
    @Inject('BookRepositoryOutPort')
    private readonly bookRepository: BookRepositoryOutPort,
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