import { Test, TestingModule } from '@nestjs/testing';
import { CreateBookUseCase } from './create-book-usecase';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { CreateBookInput } from '../ports/in/create-book-input';
import { Book } from '../entities/book.entity';
import { BookCopy } from '../../book-copy/entities/book-copy.entity';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';

describe('CreateBookUseCase', () => {
  let useCase: CreateBookUseCase;
  let bookRepository: jest.Mocked<BookRepositoryOutPort>;
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
      status: BookCopyStatus.AVAILABLE,
      book: mockBook,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as BookCopy,
    { 
      id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
      status: BookCopyStatus.AVAILABLE,
      book: mockBook,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as BookCopy,
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
        CreateBookUseCase,
        {
          provide: 'BookRepositoryOutPort',
          useValue: mockBookRepository,
        },
        {
          provide: 'BookCopyRepositoryOutPort',
          useValue: mockBookCopyRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateBookUseCase>(CreateBookUseCase);
    bookRepository = module.get('BookRepositoryOutPort');
    bookCopyRepository = module.get('BookCopyRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a book with copies successfully', async () => {
      // Arrange
      const input: CreateBookInput = {
        title: 'Clean Code',
        author: 'Robert Martin',
        imageUrl: 'image.png',
        quantity: 2,
      };

      bookRepository.create.mockResolvedValue(mockBook);
      bookCopyRepository.addCopies.mockResolvedValue(mockBookCopies);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        title: input.title,
        author: input.author,
        imageUrl: input.imageUrl,
      });
      expect(bookCopyRepository.addCopies).toHaveBeenCalledWith(mockBook, input.quantity);
      expect(result).toEqual({
        id: mockBook.id,
        title: mockBook.title,
        author: mockBook.author,
        imageUrl: mockBook.imageUrl,
        copies: mockBookCopies.length,
      });
    });

    it('should generate a valid ULID for the book', async () => {
      // Arrange
      const input: CreateBookInput = {
        title: 'Clean Code',
        author: 'Robert Martin',
        imageUrl: 'image.png',
        quantity: 1,
      };

      bookRepository.create.mockResolvedValue(mockBook);
      bookCopyRepository.addCopies.mockResolvedValue([mockBookCopies[0]]);

      // Act
      await useCase.execute(input);

      // Assert
      const createCall = bookRepository.create.mock.calls[0][0] as Partial<Book>;
      expect(createCall.id).toBeDefined();
      expect(typeof createCall.id).toBe('string');
      expect(createCall.id!.length).toBe(26); // ULID length
    });

    it('should handle creation with zero quantity', async () => {
      // Arrange
      const input: CreateBookInput = {
        title: 'Clean Code',
        author: 'Robert Martin',
        imageUrl: 'image.png',
        quantity: 0,
      };

      bookRepository.create.mockResolvedValue(mockBook);
      bookCopyRepository.addCopies.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookCopyRepository.addCopies).toHaveBeenCalledWith(mockBook, 0);
      expect(result.copies).toBe(0);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const input: CreateBookInput = {
        title: 'Clean Code',
        author: 'Robert Martin',
        imageUrl: 'image.png',
        quantity: 1,
      };

      const error = new Error('Database connection failed');
      bookRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });

    it('should propagate book copy repository errors', async () => {
      // Arrange
      const input: CreateBookInput = {
        title: 'Clean Code',
        author: 'Robert Martin',
        imageUrl: 'image.png',
        quantity: 1,
      };

      bookRepository.create.mockResolvedValue(mockBook);
      const error = new Error('Failed to create copies');
      bookCopyRepository.addCopies.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Failed to create copies');
    });
  });
});
