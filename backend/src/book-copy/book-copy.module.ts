import { Module, forwardRef } from '@nestjs/common';
import { BookCopyService } from './book-copy.service';
import { BookCopyController } from './book-copy.controller';
import { BookModule } from '../book/book.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCopy } from './entities/book-copy.entity';
import { Book } from '../book/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookCopy, Book]), forwardRef(() => BookModule)],
  controllers: [BookCopyController],
  providers: [BookCopyService],
  exports: [BookCopyService],
})
export class BookCopyModule {}
