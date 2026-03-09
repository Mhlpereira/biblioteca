import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeactivateBookInput } from '../ports/in/deactivate-book-input';
import { DeactivateBookOutput } from '../ports/out/deactivate-book-outputs';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';


@Injectable()
export class DeactivateBookUseCase {
  constructor(
    @Inject('BookRepositoryOutPort')
    private readonly bookRepository: BookRepositoryOutPort,
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