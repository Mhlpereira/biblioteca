import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetBookByIdUseCase } from './get-book-by-id-usecase';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';
import { GetBookByIdInput } from '../ports/in/get-book-by-id';
import { Book } from '../entities/book.entity';

describe('GetBookByIdUseCase', () => {
  let useCase: GetBookByIdUseCase;
  let bookRepository: jest.Mocked<BookRepositoryOutPort>;

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

  beforeEach(async () => {
    const mockBookRepository: jest.Mocked<BookRepositoryOutPort> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBookByIdUseCase,
        {
          provide: 'BookRepositoryOutPort',
          useValue: mockBookRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetBookByIdUseCase>(GetBookByIdUseCase);
    bookRepository = module.get('BookRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should get book by id successfully', async () => {
      // Arrange
      const input: GetBookByIdInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      bookRepository.findById.mockResolvedValue(mockBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findById).toHaveBeenCalledWith(input.id);
      expect(result).toEqual({
        id: mockBook.id,
        title: mockBook.title,
        author: mockBook.author,
        imageUrl: mockBook.imageUrl,
        active: mockBook.active,
      });
    });

    it('should return active book correctly', async () => {
      // Arrange
      const input: GetBookByIdInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const activeBook = { ...mockBook, active: true };
      bookRepository.findById.mockResolvedValue(activeBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.active).toBe(true);
    });

    it('should return inactive book correctly', async () => {
      // Arrange
      const input: GetBookByIdInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const inactiveBook = { ...mockBook, active: false };
      bookRepository.findById.mockResolvedValue(inactiveBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.active).toBe(false);
    });

    it('should handle book with null imageUrl', async () => {
      // Arrange
      const input: GetBookByIdInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const bookWithoutImage = { ...mockBook, imageUrl: null as any };
      bookRepository.findById.mockResolvedValue(bookWithoutImage);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.imageUrl).toBeNull();
    });

    it('should handle book with empty imageUrl', async () => {
      // Arrange
      const input: GetBookByIdInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const bookWithEmptyImage = { ...mockBook, imageUrl: '' };
      bookRepository.findById.mockResolvedValue(bookWithEmptyImage);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.imageUrl).toBe('');
    });

    it('should throw NotFoundException when book is not found', async () => {
      // Arrange
      const input: GetBookByIdInput = {
        id: 'non-existent-id',
      };

      bookRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundException('Livro não encontrado')
      );
      expect(bookRepository.findById).toHaveBeenCalledWith(input.id);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const input: GetBookByIdInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const error = new Error('Database connection failed');
      bookRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });

    it('should not modify the original book object', async () => {
      // Arrange
      const input: GetBookByIdInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const originalBook = { ...mockBook };
      bookRepository.findById.mockResolvedValue(originalBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(originalBook).toEqual(mockBook); // Original object should remain unchanged
      expect(result).not.toBe(originalBook); // Result should be a different object
    });

    it('should handle various ULID formats', async () => {
      // Arrange
      const validUlids = [
        '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        '01HJQZ5R3N7MTXVGQE5J8K9M0R',
      ];

      for (const ulid of validUlids) {
        const input: GetBookByIdInput = { id: ulid };
        const book = { ...mockBook, id: ulid };
        bookRepository.findById.mockResolvedValue(book);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(result.id).toBe(ulid);
        expect(bookRepository.findById).toHaveBeenCalledWith(ulid);

        jest.clearAllMocks();
      }
    });
  });
});
