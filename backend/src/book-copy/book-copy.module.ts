import { Module } from '@nestjs/common';
import { BookCopyService } from './book-copy.service';
import { BookCopyController } from './book-copy.controller';

@Module({
  controllers: [BookCopyController],
  providers: [BookCopyService],
})
export class BookCopyModule {}
