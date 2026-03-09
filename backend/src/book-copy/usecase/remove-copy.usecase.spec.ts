import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RemoveCopyUseCase } from './remove-copy.usecase';
import { BookCopyRepositoryOutPort } from '../ports/book-copy-out.port';
import { RemoveCopy } from '../ports/in/remove-copy.in';
import { BookCopy } from '../entities/book-copy.entity';
import { Book } from '../../book/entities/book.entity';
import { BookCopyStatus } from '../enum/book-status.enum';

describe('RemoveCopyUseCase', () => {
  let useCase: RemoveCopyUseCase;
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
        RemoveCopyUseCase,
        {
          provide: 'BookCopyRepositoryOutPort',
          useValue: mockBookCopyRepository,
        },
      ],
    }).compile();

    useCase = module.get<RemoveCopyUseCase>(RemoveCopyUseCase);
    bookCopyRepository = module.get('BookCopyRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should remove copy successfully when copy is available', async () => {
      // Arrange
      const input: RemoveCopy = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
      };

      bookCopyRepository.findByIdWithBook.mockResolvedValue(mockBookCopy);
      bookCopyRepository.updateStatus.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookCopyRepository.findByIdWithBook).toHaveBeenCalledWith(input.copyId);
      expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(
        mockBookCopy.id,
        BookCopyStatus.REMOVED
      );
      expect(result).toEqual({
        message: 'Cópia removida com sucesso',
        copyId: mockBookCopy.id,
        bookTitle: mockBook.title,
      });
    });

    it('should throw NotFoundException when copy does not exist', async () => {
      // Arrange
      const input: RemoveCopy = {
        copyId: 'non-existent-id',
      };

      bookCopyRepository.findByIdWithBook.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundException('Cópia do livro não encontrada')
      );
      expect(bookCopyRepository.findByIdWithBook).toHaveBeenCalledWith(input.copyId);
      expect(bookCopyRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when copy is not available', async () => {
      // Arrange
      const input: RemoveCopy = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
      };

      const reservedCopy: BookCopy = {
        ...mockBookCopy,
        status: BookCopyStatus.RESERVED,
      };

      bookCopyRepository.findByIdWithBook.mockResolvedValue(reservedCopy);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        new BadRequestException(
          `Não é possível remover a cópia. Status atual: ${BookCopyStatus.RESERVED}`
        )
      );
      expect(bookCopyRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when copy is already removed', async () => {
      // Arrange
      const input: RemoveCopy = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
      };

      const removedCopy: BookCopy = {
        ...mockBookCopy,
        status: BookCopyStatus.REMOVED,
      };

      bookCopyRepository.findByIdWithBook.mockResolvedValue(removedCopy);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        new BadRequestException(
          `Não é possível remover a cópia. Status atual: ${BookCopyStatus.REMOVED}`
        )
      );
    });

    it('should handle copy with missing book information', async () => {
      // Arrange
      const input: RemoveCopy = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
      };

      const copyWithoutBook: BookCopy = {
        ...mockBookCopy,
        book: null as any,
      };

      bookCopyRepository.findByIdWithBook.mockResolvedValue(copyWithoutBook);
      bookCopyRepository.updateStatus.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        message: 'Cópia removida com sucesso',
        copyId: copyWithoutBook.id,
        bookTitle: undefined, // book?.title when book is null
      });
    });

    it('should handle copy with book that has no title', async () => {
      // Arrange
      const input: RemoveCopy = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
      };

      const bookWithoutTitle = { ...mockBook, title: undefined as any };
      const copyWithBookWithoutTitle: BookCopy = {
        ...mockBookCopy,
        book: bookWithoutTitle,
      };

      bookCopyRepository.findByIdWithBook.mockResolvedValue(copyWithBookWithoutTitle);
      bookCopyRepository.updateStatus.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.bookTitle).toBeUndefined();
    });

    it('should propagate repository errors on findByIdWithBook', async () => {
      // Arrange
      const input: RemoveCopy = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
      };

      const error = new Error('Database connection failed');
      bookCopyRepository.findByIdWithBook.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });

    it('should propagate repository errors on updateStatus', async () => {
      // Arrange
      const input: RemoveCopy = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
      };

      bookCopyRepository.findByIdWithBook.mockResolvedValue(mockBookCopy);
      const error = new Error('Update failed');
      bookCopyRepository.updateStatus.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Update failed');
    });

    it('should only allow removal of AVAILABLE status copies', async () => {
      // Arrange
      const input: RemoveCopy = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
      };

      // Test all non-available statuses
      const nonAvailableStatuses = [BookCopyStatus.RESERVED, BookCopyStatus.REMOVED];

      for (const status of nonAvailableStatuses) {
        const copyWithStatus: BookCopy = {
          ...mockBookCopy,
          status,
        };

        bookCopyRepository.findByIdWithBook.mockResolvedValue(copyWithStatus);

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);

        jest.clearAllMocks();
      }
    });
  });
});
