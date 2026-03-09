import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeactivateBookUseCase } from './deactivate-book-usecase';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';
import { DeactivateBookInput } from '../ports/in/deactivate-book-input';
import { Book } from '../entities/book.entity';

describe('DeactivateBookUseCase', () => {
  let useCase: DeactivateBookUseCase;
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
        DeactivateBookUseCase,
        {
          provide: 'BookRepositoryOutPort',
          useValue: mockBookRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeactivateBookUseCase>(DeactivateBookUseCase);
    bookRepository = module.get('BookRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should deactivate a book successfully', async () => {
      // Arrange
      const input: DeactivateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const deactivatedBook = { ...mockBook, active: false };
      bookRepository.findById.mockResolvedValue(mockBook);
      bookRepository.update.mockResolvedValue(deactivatedBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findById).toHaveBeenCalledWith(input.id);
      expect(bookRepository.update).toHaveBeenCalledWith({
        ...mockBook,
        active: false,
      });
      expect(result).toEqual({
        id: mockBook.id,
        active: false,
      });
    });

    it('should throw NotFoundException when book is not found', async () => {
      // Arrange
      const input: DeactivateBookInput = {
        id: 'non-existent-id',
      };

      bookRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundException('Livro não encontrado')
      );
      expect(bookRepository.findById).toHaveBeenCalledWith(input.id);
      expect(bookRepository.update).not.toHaveBeenCalled();
    });

    it('should handle already deactivated book', async () => {
      // Arrange
      const input: DeactivateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const alreadyDeactivatedBook = { ...mockBook, active: false };
      bookRepository.findById.mockResolvedValue(alreadyDeactivatedBook);
      bookRepository.update.mockResolvedValue(alreadyDeactivatedBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.update).toHaveBeenCalledWith({
        ...alreadyDeactivatedBook,
        active: false,
      });
      expect(result.active).toBe(false);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const input: DeactivateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      bookRepository.findById.mockResolvedValue(mockBook);
      const error = new Error('Database connection failed');
      bookRepository.update.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });

    it('should modify the book object correctly before updating', async () => {
      // Arrange
      const input: DeactivateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const originalBook = { ...mockBook };
      bookRepository.findById.mockResolvedValue(originalBook);
      bookRepository.update.mockResolvedValue({ ...originalBook, active: false });

      // Act
      await useCase.execute(input);

      // Assert
      expect(originalBook.active).toBe(false); // The original object should be modified
      expect(bookRepository.update).toHaveBeenCalledWith(originalBook);
    });
  });
});
