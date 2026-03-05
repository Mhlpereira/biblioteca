import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCopyModule } from '../book-copy/book-copy.module';
import { BookController } from './book.controller';
import { BookRepository } from './book.repository';
import { Book } from './entities/book.entity';
import { CreateBookUseCase } from './use-cases/create-book-usecase';
import { DeactivateBookUseCase } from './use-cases/deactivate-book-usecase';
import { FindAllBooksUseCase } from './use-cases/find-all-books-usecase';
import { GetBookByIdUseCase } from './use-cases/get-book-by-id-usecase';
import { UpdateBookUseCase } from './use-cases/update-book-usecase';


@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    BookCopyModule, // perguntar para o thiaky ou o vitor pois importa só o repository ou módulo todo
  ],
  controllers: [BookController],
  providers: [
    {
      provide: 'IBookRepository',
      useClass: BookRepository,
    },
    CreateBookUseCase,
    GetBookByIdUseCase,
    FindAllBooksUseCase,
    UpdateBookUseCase,
    DeactivateBookUseCase,
  ],
})
export class BookModule {}