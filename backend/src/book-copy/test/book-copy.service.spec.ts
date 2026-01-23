import { Test, TestingModule } from '@nestjs/testing';
import { BookCopyService } from '../book-copy.service';

describe('BookCopyService', () => {
  let service: BookCopyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookCopyService],
    }).compile();

    service = module.get<BookCopyService>(BookCopyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
