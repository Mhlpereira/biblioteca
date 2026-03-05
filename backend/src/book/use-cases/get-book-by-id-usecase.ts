import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBookRepository } from '../ports/i-book-repository';
import { GetBookByIdInput } from '../in/get-book-by-id';
import { GetBookByIdOutput } from '../out/get-book-by-id-output';


@Injectable()
export class GetBookByIdUseCase {
  constructor(
    @Inject('IBookRepository')
    private readonly bookRepository: IBookRepository,
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