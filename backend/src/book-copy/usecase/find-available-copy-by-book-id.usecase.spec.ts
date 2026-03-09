import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindAvailableCopyByBookIdUseCase } from './find-available-copy-by-book-id.usecase';
import { BookCopyRepositoryOutPort } from '../ports/book-copy-out.port';
import { FindAvailableCopyInput } from '../ports/in/find-available-copy.in';
import { BookCopy } from '../entities/book-copy.entity';
import { Book } from '../../book/entities/book.entity';
import { BookCopyStatus } from '../enum/book-status.enum';

describe('FindAvailableCopyByBookIdUseCase', () => {
  let useCase: FindAvailableCopyByBookIdUseCase;
  let bookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort>;

  const mockBook: Book = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
    title: 'Clean Code',
    author: 'Robert Martin',
    imageUrl: 'image.png',
    active: true,
    copies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBookCopy: BookCopy = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
    book: mockBook,
    status: BookCopyStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockBookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort> = {
      addCopies: jest.fn(),
      findByIdWithBook: jest.fn(),
      findAvailableByBookId: jest.fn(),
      updateStatus: jest.fn(),
      findAllByBook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAvailableCopyByBookIdUseCase,
        {
          provide: 'BookCopyRepositoryOutPort',
          useValue: mockBookCopyRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAvailableCopyByBookIdUseCase>(FindAvailableCopyByBookIdUseCase);
    bookCopyRepository = module.get('BookCopyRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should find available copy successfully', async () => {

      const input: FindAvailableCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockBookCopy);


      const result = await useCase.execute(input);


      expect(bookCopyRepository.findAvailableByBookId).toHaveBeenCalledWith(input.bookId);
      expect(result).toEqual({
        id: mockBookCopy.id,
        bookTitle: mockBook.title,
        status: BookCopyStatus.AVAILABLE,
        bookId: input.bookId,
      });
    });

    it('should throw NotFoundException when no available copy is found', async () => {

      const input: FindAvailableCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(null);


      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundException('Sem livros disponíveis')
      );
      expect(bookCopyRepository.findAvailableByBookId).toHaveBeenCalledWith(input.bookId);
    });

    it('should handle copy with missing book information', async () => {

      const input: FindAvailableCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const copyWithoutBook: BookCopy = {
        ...mockBookCopy,
        book: null as any,
      };

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(copyWithoutBook);


      const result = await useCase.execute(input);


      expect(result).toEqual({
        id: copyWithoutBook.id,
        bookTitle: '', 
        status: BookCopyStatus.AVAILABLE,
        bookId: input.bookId,
      });
    });

    it('should handle copy with book that has no title', async () => {

      const input: FindAvailableCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const bookWithoutTitle = { ...mockBook, title: undefined as any };
      const copyWithBookWithoutTitle: BookCopy = {
        ...mockBookCopy,
        book: bookWithoutTitle,
      };

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(copyWithBookWithoutTitle);


      const result = await useCase.execute(input);


      expect(result.bookTitle).toBe('');
    });

    it('should use input bookId in output', async () => {

      const input: FindAvailableCopyInput = {
        bookId: 'specific-book-id',
      };


      const mockCopyWithDifferentBookId: BookCopy = {
        ...mockBookCopy,
        book: { ...mockBook, id: 'different-book-id' },
      };

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockCopyWithDifferentBookId);


      const result = await useCase.execute(input);


      expect(result.bookId).toBe('specific-book-id'); 
    });

    it('should propagate repository errors', async () => {

      const input: FindAvailableCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const error = new Error('Database connection failed');
      bookCopyRepository.findAvailableByBookId.mockRejectedValue(error);


      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });

    it('should preserve copy status in output', async () => {

      const input: FindAvailableCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };



      const copyWithExpectedStatus = {
        ...mockBookCopy,
        status: BookCopyStatus.AVAILABLE,
      };

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(copyWithExpectedStatus);


      const result = await useCase.execute(input);


      expect(result.status).toBe(BookCopyStatus.AVAILABLE);
    });
  });
});
