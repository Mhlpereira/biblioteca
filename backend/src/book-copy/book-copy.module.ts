import { Module } from '@nestjs/common';
import { BookCopyService } from './book-copy.service';
import { BookCopyController } from './book-copy.controller';
import { BookModule } from '../book/book.module';

@Module({
  imports:[BookModule],
  controllers: [BookCopyController],
  providers: [BookCopyService],
})
export class BookCopyModule {}
