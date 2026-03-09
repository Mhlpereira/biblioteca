import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateBookInput } from '../ports/in/update-book-input';
import { UpdateBookOutput } from '../ports/out/update-book-output';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';

@Injectable()
export class UpdateBookUseCase {
  constructor(
    @Inject('BookRepositoryOutPort')
    private readonly bookRepository: BookRepositoryOutPort,
  ) {}

  async execute(input: UpdateBookInput): Promise<UpdateBookOutput> {
    const book = await this.bookRepository.findById(input.id);

    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }

    if (input.title !== undefined) {
      book.title = input.title;
    }

    if (input.author !== undefined) {
      book.author = input.author;
    }

    const updated = await this.bookRepository.update(book);

    return {
      id: updated.id,
      title: updated.title,
      author: updated.author,
      imageUrl: updated.imageUrl,
    };
  }
}