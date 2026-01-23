import { Injectable } from '@nestjs/common';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';

@Injectable()
export class BookCopyService {
  create(createBookCopyDto: CreateBookCopyDto) {
    return 'This action adds a new bookCopy';
  }

  findAll() {
    return `This action returns all bookCopy`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookCopy`;
  }

  update(id: number, updateBookCopyDto: UpdateBookCopyDto) {
    return `This action updates a #${id} bookCopy`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookCopy`;
  }
}
