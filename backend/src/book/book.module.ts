import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { BookCopyModule } from '../book-copy/book-copy.module';

@Module({
  imports: [BookCopyModule],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
