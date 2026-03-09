import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateBookUseCase } from './update-book-usecase';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';
import { UpdateBookInput } from '../ports/in/update-book-input';
import { Book } from '../entities/book.entity';

describe('UpdateBookUseCase', () => {
  let useCase: UpdateBookUseCase;
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
        UpdateBookUseCase,
        {
          provide: 'BookRepositoryOutPort',
          useValue: mockBookRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateBookUseCase>(UpdateBookUseCase);
    bookRepository = module.get('BookRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update book title successfully', async () => {
      // Arrange
      const input: UpdateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: 'Updated Clean Code',
      };

      const updatedBook = { ...mockBook, title: 'Updated Clean Code' };
      bookRepository.findById.mockResolvedValue(mockBook);
      bookRepository.update.mockResolvedValue(updatedBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findById).toHaveBeenCalledWith(input.id);
      expect(bookRepository.update).toHaveBeenCalledWith({
        ...mockBook,
        title: 'Updated Clean Code',
      });
      expect(result).toEqual({
        id: updatedBook.id,
        title: updatedBook.title,
        author: updatedBook.author,
        imageUrl: updatedBook.imageUrl,
      });
    });

    it('should update book author successfully', async () => {
      // Arrange
      const input: UpdateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        author: 'Uncle Bob',
      };

      const updatedBook = { ...mockBook, author: 'Uncle Bob' };
      bookRepository.findById.mockResolvedValue(mockBook);
      bookRepository.update.mockResolvedValue(updatedBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.update).toHaveBeenCalledWith({
        ...mockBook,
        author: 'Uncle Bob',
      });
      expect(result.author).toBe('Uncle Bob');
    });

    it('should update both title and author successfully', async () => {
      // Arrange
      const input: UpdateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: 'Clean Code: A Handbook',
        author: 'Uncle Bob',
      };

      const updatedBook = {
        ...mockBook,
        title: 'Clean Code: A Handbook',
        author: 'Uncle Bob',
      };
      bookRepository.findById.mockResolvedValue(mockBook);
      bookRepository.update.mockResolvedValue(updatedBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.update).toHaveBeenCalledWith({
        ...mockBook,
        title: 'Clean Code: A Handbook',
        author: 'Uncle Bob',
      });
      expect(result.title).toBe('Clean Code: A Handbook');
      expect(result.author).toBe('Uncle Bob');
    });

    it('should not update fields that are undefined', async () => {
      // Arrange
      const input: UpdateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: undefined,
        author: undefined,
      };

      bookRepository.findById.mockResolvedValue(mockBook);
      bookRepository.update.mockResolvedValue(mockBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.update).toHaveBeenCalledWith(mockBook);
      expect(result.title).toBe(mockBook.title);
      expect(result.author).toBe(mockBook.author);
    });

    it('should handle empty string updates', async () => {
      // Arrange
      const input: UpdateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: '',
        author: '',
      };

      const updatedBook = { ...mockBook, title: '', author: '' };
      bookRepository.findById.mockResolvedValue(mockBook);
      bookRepository.update.mockResolvedValue(updatedBook);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.update).toHaveBeenCalledWith({
        ...mockBook,
        title: '',
        author: '',
      });
      expect(result.title).toBe('');
      expect(result.author).toBe('');
    });

    it('should throw NotFoundException when book is not found', async () => {
      // Arrange
      const input: UpdateBookInput = {
        id: 'non-existent-id',
        title: 'New Title',
      };

      bookRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundException('Livro não encontrado')
      );
      expect(bookRepository.findById).toHaveBeenCalledWith(input.id);
      expect(bookRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate repository errors on findById', async () => {
      // Arrange
      const input: UpdateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: 'New Title',
      };

      const error = new Error('Database connection failed');
      bookRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });

    it('should propagate repository errors on update', async () => {
      // Arrange
      const input: UpdateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: 'New Title',
      };

      bookRepository.findById.mockResolvedValue(mockBook);
      const error = new Error('Update failed');
      bookRepository.update.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Update failed');
    });

    it('should modify the original book object before updating', async () => {
      // Arrange
      const input: UpdateBookInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: 'New Title',
      };

      const originalBook = { ...mockBook };
      const updatedBook = { ...mockBook, title: 'New Title' };
      bookRepository.findById.mockResolvedValue(originalBook);
      bookRepository.update.mockResolvedValue(updatedBook);

      // Act
      await useCase.execute(input);

      // Assert
      expect(originalBook.title).toBe('New Title'); // Original object should be modified
      expect(bookRepository.update).toHaveBeenCalledWith(originalBook);
    });
  });
});
