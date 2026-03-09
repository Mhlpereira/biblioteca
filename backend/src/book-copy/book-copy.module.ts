import { Module } from '@nestjs/common';
import { BookCopyController } from './book-copy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCopy } from './entities/book-copy.entity';
import { Book } from '../book/entities/book.entity';
import { BookCopyRepository } from './repository/book-copy.repository';
import { AddCopyUseCase } from './usecase/add-copy.usecase';
import { FindAllByBookUseCase } from './usecase/find-all-by-book.usecase';
import { FindAvailableCopyByBookIdUseCase } from './usecase/find-available-copy-by-book-id.usecase';
import { RemoveCopyUseCase } from './usecase/remove-copy.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([BookCopy, Book])],
  controllers: [BookCopyController],
  providers: [
    {
      provide: 'BookCopyRepositoryOutPort',
      useClass: BookCopyRepository,
    },
    AddCopyUseCase,
    FindAllByBookUseCase,
    FindAvailableCopyByBookIdUseCase,
    RemoveCopyUseCase,
  ],
  exports: ['BookCopyRepositoryOutPort'],
})
export class BookCopyModule {}
