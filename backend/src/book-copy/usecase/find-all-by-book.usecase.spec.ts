import { Test, TestingModule } from '@nestjs/testing';
import { FindAllByBookUseCase } from './find-all-by-book.usecase';
import { BookCopyRepositoryOutPort } from '../ports/book-copy-out.port';
import { FindAllByBookInput } from '../ports/in/find-all-by-book.in';
import { BookCopy } from '../entities/book-copy.entity';
import { Book } from '../../book/entities/book.entity';
import { BookCopyStatus } from '../enum/book-status.enum';
import { PaginatedResult } from '../../common/interfaces/paginated.interface';

describe('FindAllByBookUseCase', () => {
  let useCase: FindAllByBookUseCase;
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

  const mockBookCopies: BookCopy[] = [
    {
      id: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
      book: mockBook,
      status: BookCopyStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
      book: mockBook,
      status: BookCopyStatus.RESERVED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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
        FindAllByBookUseCase,
        {
          provide: 'BookCopyRepositoryOutPort',
          useValue: mockBookCopyRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllByBookUseCase>(FindAllByBookUseCase);
    bookCopyRepository = module.get('BookCopyRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should find all copies for a book successfully', async () => {
      // Arrange
      const input: FindAllByBookInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const mockPaginatedResult: PaginatedResult<BookCopy> = {
        data: mockBookCopies,
        meta: {
          total: 2,
          page: 1,
          lastPage: 1,
        },
      };

      bookCopyRepository.findAllByBook.mockResolvedValue(mockPaginatedResult);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookCopyRepository.findAllByBook).toHaveBeenCalledWith(input.bookId);
      expect(result).toEqual({
        data: [
          {
            id: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
            status: BookCopyStatus.AVAILABLE,
            bookId: mockBook.id,
            bookTitle: mockBook.title,
          },
          {
            id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
            status: BookCopyStatus.RESERVED,
            bookId: mockBook.id,
            bookTitle: mockBook.title,
          },
        ],
        meta: {
          total: 2,
          page: 1,
          lastPage: 1,
        },
      });
    });

    it('should handle empty result', async () => {
      // Arrange
      const input: FindAllByBookInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const mockEmptyResult: PaginatedResult<BookCopy> = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          lastPage: 1,
        },
      };

      bookCopyRepository.findAllByBook.mockResolvedValue(mockEmptyResult);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          lastPage: 1,
        },
      });
    });

    it('should handle copies with missing book information', async () => {
      // Arrange
      const input: FindAllByBookInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const copyWithoutBook: BookCopy = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0S',
        book: null as any,
        status: BookCopyStatus.AVAILABLE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResult: PaginatedResult<BookCopy> = {
        data: [copyWithoutBook],
        meta: {
          total: 1,
          page: 1,
          lastPage: 1,
        },
      };

      bookCopyRepository.findAllByBook.mockResolvedValue(mockResult);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.data[0]).toEqual({
        id: copyWithoutBook.id,
        status: BookCopyStatus.AVAILABLE,
        bookId: undefined,
        bookTitle: undefined,
      });
    });

    it('should preserve pagination metadata', async () => {
      // Arrange
      const input: FindAllByBookInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const mockResult: PaginatedResult<BookCopy> = {
        data: [mockBookCopies[0]],
        meta: {
          total: 10,
          page: 3,
          lastPage: 5,
        },
      };

      bookCopyRepository.findAllByBook.mockResolvedValue(mockResult);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.meta).toEqual({
        total: 10,
        page: 3,
        lastPage: 5,
      });
    });

    it('should handle different copy statuses', async () => {
      // Arrange
      const input: FindAllByBookInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const copiesWithDifferentStatus: BookCopy[] = [
        { ...mockBookCopies[0], status: BookCopyStatus.AVAILABLE },
        { ...mockBookCopies[1], status: BookCopyStatus.RESERVED },
        { ...mockBookCopies[0], id: '01HJQZ5R3N7MTXVGQE5J8K9M0S', status: BookCopyStatus.REMOVED },
      ];

      const mockResult: PaginatedResult<BookCopy> = {
        data: copiesWithDifferentStatus,
        meta: {
          total: 3,
          page: 1,
          lastPage: 1,
        },
      };

      bookCopyRepository.findAllByBook.mockResolvedValue(mockResult);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.data.map(copy => copy.status)).toEqual([
        BookCopyStatus.AVAILABLE,
        BookCopyStatus.RESERVED,
        BookCopyStatus.REMOVED,
      ]);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const input: FindAllByBookInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const error = new Error('Database connection failed');
      bookCopyRepository.findAllByBook.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });
  });
});
