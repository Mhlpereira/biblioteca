import { Inject, Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
import { CreateBookInput } from '../ports/in/create-book-input';
import { CreateBookOutput } from '../ports/out/create-book-output';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';


@Injectable()
export class CreateBookUseCase {
  constructor(
    @Inject('BookRepositoryOutPort')
    private readonly bookRepository: BookRepositoryOutPort,

    @Inject('BookCopyRepositoryOutPort')
    private readonly bookCopyRepository: BookCopyRepositoryOutPort,
  ) {}

  async execute(input: CreateBookInput): Promise<CreateBookOutput> {
    const book = await this.bookRepository.create({
      id: ulid(),
      title: input.title,
      author: input.author,
      imageUrl: input.imageUrl,
    });

    const copies = await this.bookCopyRepository.addCopies(book, input.quantity);

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl,
      copies: copies.length,
    };
  }
}