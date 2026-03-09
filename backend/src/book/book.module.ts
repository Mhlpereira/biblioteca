import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCopyModule } from '../book-copy/book-copy.module';
import { BookController } from './book.controller';
import { BookRepository } from './repository/book.repository';
import { Book } from './entities/book.entity';
import { CreateBookUseCase } from './use-cases/create-book-usecase';
import { DeactivateBookUseCase } from './use-cases/deactivate-book-usecase';
import { FindAllBooksUseCase } from './use-cases/find-all-books-usecase';
import { GetBookByIdUseCase } from './use-cases/get-book-by-id-usecase';
import { UpdateBookUseCase } from './use-cases/update-book-usecase';


@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    BookCopyModule,
  ],
  controllers: [BookController],
  providers: [
    {
      provide: 'BookRepositoryOutPort',
      useClass: BookRepository,
    },
    CreateBookUseCase,
    GetBookByIdUseCase,
    FindAllBooksUseCase,
    UpdateBookUseCase,
    DeactivateBookUseCase,
  ],
  exports:['BookRepositoryOutPort']
})
export class BookModule {}