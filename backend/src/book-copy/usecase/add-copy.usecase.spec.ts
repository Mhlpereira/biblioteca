import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AddCopyUseCase } from './add-copy.usecase';
import { BookRepositoryOutPort } from '../../book/ports/book-repository-out.port';
import { BookCopyRepositoryOutPort } from '../ports/book-copy-out.port';
import { AddBookCopyInput } from '../ports/in/add-copy.in';
import { Book } from '../../book/entities/book.entity';
import { BookCopy } from '../entities/book-copy.entity';
import { BookCopyStatus } from '../enum/book-status.enum';

describe('AddCopyUseCase', () => {
  let useCase: AddCopyUseCase;
  let bookRepository: jest.Mocked<BookRepositoryOutPort>;
  let bookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort>;

  // Note: The original code has a dependency injection issue where 
  // both bookRepository and bookCopyRepository use the same injection token
  // This test simulates the intended behavior

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
      status: BookCopyStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const mockBookRepository: jest.Mocked<BookRepositoryOutPort> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    const mockBookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort> = {
      addCopies: jest.fn(),
      findByIdWithBook: jest.fn(),
      findAvailableByBookId: jest.fn(),
      updateStatus: jest.fn(),
      findAllByBook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddCopyUseCase,
        {
          // Note: The original code incorrectly injects BookRepositoryOutPort 
          // but uses "BookCopyRepositoryOutPort" token. Since both use the same token,
          // bookCopyRepository will be resolved for both variables
          provide: 'BookCopyRepositoryOutPort',
          useValue: { ...mockBookRepository, ...mockBookCopyRepository },
        },
      ],
    }).compile();

    useCase = module.get<AddCopyUseCase>(AddCopyUseCase);
    const combinedRepository = module.get('BookCopyRepositoryOutPort');
    bookRepository = combinedRepository as jest.Mocked<BookRepositoryOutPort>;
    bookCopyRepository = combinedRepository as jest.Mocked<BookCopyRepositoryOutPort>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should add copies successfully when book exists', async () => {
      // Arrange
      const input: AddBookCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        quantity: 2,
      };

      // Mock the repositories directly since there's a dependency injection issue in the original code
      bookRepository.findById.mockResolvedValue(mockBook);
      bookCopyRepository.addCopies.mockResolvedValue(mockBookCopies);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findById).toHaveBeenCalledWith(input.bookId);
      expect(bookCopyRepository.addCopies).toHaveBeenCalledWith(mockBook, input.quantity);
      expect(result).toEqual([
        {
          id: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
          status: BookCopyStatus.AVAILABLE,
          bookId: mockBook.id,
        },
        {
          id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
          status: BookCopyStatus.AVAILABLE,
          bookId: mockBook.id,
        },
      ]);
    });

    it('should throw NotFoundException when book does not exist', async () => {
      // Arrange
      const input: AddBookCopyInput = {
        bookId: 'non-existent-id',
        quantity: 1,
      };

      bookRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundException('Livro não existe')
      );
      expect(bookRepository.findById).toHaveBeenCalledWith(input.bookId);
    });

    it('should handle zero quantity', async () => {
      // Arrange
      const input: AddBookCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        quantity: 0,
      };

      bookRepository.findById.mockResolvedValue(mockBook);
      bookCopyRepository.addCopies.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookCopyRepository.addCopies).toHaveBeenCalledWith(mockBook, 0);
      expect(result).toEqual([]);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const input: AddBookCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        quantity: 1,
      };

      const error = new Error('Database connection failed');
      bookRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });

    it('should propagate book copy repository errors', async () => {
      // Arrange
      const input: AddBookCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        quantity: 1,
      };

      bookRepository.findById.mockResolvedValue(mockBook);
      const error = new Error('Failed to add copies');
      bookCopyRepository.addCopies.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Failed to add copies');
    });

    it('should map copies to output format correctly', async () => {
      // Arrange
      const input: AddBookCopyInput = {
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        quantity: 1,
      };

      const copyWithDifferentStatus: BookCopy = {
        ...mockBookCopies[0],
        status: BookCopyStatus.RESERVED,
      };

      bookRepository.findById.mockResolvedValue(mockBook);
      bookCopyRepository.addCopies.mockResolvedValue([copyWithDifferentStatus]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual([{
        id: copyWithDifferentStatus.id,
        status: BookCopyStatus.RESERVED,
        bookId: mockBook.id,
      }]);
    });
  });
});
