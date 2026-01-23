import { Test, TestingModule } from '@nestjs/testing';
import { BookCopyController } from '../book-copy.controller';
import { BookCopyService } from '../book-copy.service';

describe('BookCopyController', () => {
  let controller: BookCopyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookCopyController],
      providers: [BookCopyService],
    }).compile();

    controller = module.get<BookCopyController>(BookCopyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
