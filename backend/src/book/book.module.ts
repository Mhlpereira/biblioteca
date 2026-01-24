import { Module, forwardRef } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { BookCopyModule } from '../book-copy/book-copy.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), forwardRef(() => BookCopyModule)],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
