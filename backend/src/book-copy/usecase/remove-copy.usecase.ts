import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RemoveCopy } from '../ports/in/remove-copy.in';
import { BookCopyRepositoryOutPort } from '../ports/book-copy-out.port';
import { BookCopyStatus } from '../enum/book-status.enum';
import { RemoveCopyOutput } from '../ports/out/remove-copy.out';

@Injectable()
export class RemoveCopyUseCase {
  constructor(
    @Inject('BookCopyRepositoryOutPort')
    private readonly bookCopyRepository: BookCopyRepositoryOutPort,
  ) {}

  async execute(input: RemoveCopy): Promise<RemoveCopyOutput> {
    const copy = await this.bookCopyRepository.findByIdWithBook(input.copyId);

    if (!copy) {
      throw new NotFoundException('Cópia do livro não encontrada');
    }

    if (copy.status !== BookCopyStatus.AVAILABLE) {
      throw new BadRequestException(
        `Não é possível remover a cópia. Status atual: ${copy.status}`,
      );
    }

    await this.bookCopyRepository.updateStatus(copy.id, BookCopyStatus.REMOVED);

    return {
      message: 'Cópia removida com sucesso',
      copyId: copy.id,
      bookTitle: copy.book?.title,
    };
  }
}