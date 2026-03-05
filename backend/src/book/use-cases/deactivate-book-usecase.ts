import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeactivateBookInput } from '../in/deactivate-book-input';
import { DeactivateBookOutput } from '../out/deactivate-book-outputs';
import { IBookRepository } from '../ports/i-book-repository';


@Injectable()
export class DeactivateBookUseCase {
  constructor(
    @Inject('IBookRepository')
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(input: DeactivateBookInput): Promise<DeactivateBookOutput> {
    const book = await this.bookRepository.findById(input.id);

    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }


    book.active = false;

    await this.bookRepository.update(book);

    return {
      id: book.id,
      active: book.active,
    };
  }
}