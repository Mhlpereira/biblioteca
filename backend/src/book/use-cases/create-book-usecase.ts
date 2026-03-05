import { Inject, Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
import { IBookRepository } from '../ports/i-book-repository';
import { CreateBookInput } from '../in/create-book-input';
import { CreateBookOutput } from '../out/create-book-output';
import { IBookCopyRepository } from '../../book-copy/ports/i-book-copy-repository';


@Injectable()
export class CreateBookUseCase {
  constructor(
    @Inject('IBookRepository')
    private readonly bookRepository: IBookRepository,

    @Inject('IBookCopyRepository')
    private readonly bookCopyRepository: IBookCopyRepository,
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