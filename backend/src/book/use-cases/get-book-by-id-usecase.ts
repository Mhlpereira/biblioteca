import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GetBookByIdInput } from '../ports/in/get-book-by-id';
import { GetBookByIdOutput } from '../ports/out/get-book-by-id-output';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';


@Injectable()
export class GetBookByIdUseCase {
  constructor(
    @Inject('BookRepositoryOutPort')
    private readonly bookRepository: BookRepositoryOutPort,
  ) {}

  async execute(input: GetBookByIdInput): Promise<GetBookByIdOutput> {
    const book = await this.bookRepository.findById(input.id);

    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl,
      active: book.active,
    };
  }
}