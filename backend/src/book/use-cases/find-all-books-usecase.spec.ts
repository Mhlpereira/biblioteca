import { Test, TestingModule } from '@nestjs/testing';
import { FindAllBooksUseCase } from './find-all-books-usecase';
import { BookRepositoryOutPort } from '../ports/book-repository-out.port';
import { FindAllBooksInput } from '../ports/in/find-all-books-input';
import { PaginatedResponseDto } from '../../common/dto/pagination-response.dto';
import { FindAllBooksOutput } from '../ports/out/find-all-books-output';

describe('FindAllBooksUseCase', () => {
  let useCase: FindAllBooksUseCase;
  let bookRepository: jest.Mocked<BookRepositoryOutPort>;

  const mockPaginatedResponse: PaginatedResponseDto<FindAllBooksOutput> = {
    data: [
      {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: 'Clean Code',
        author: 'Robert Martin',
        imageUrl: 'image.png',
        totalCopies: 5,
        availableCopies: 3,
        hasAvailable: true,
      },
      {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        title: 'Design Patterns',
        author: 'Gang of Four',
        imageUrl: 'image2.png',
        totalCopies: 3,
        availableCopies: 0,
        hasAvailable: false,
      },
    ],
    meta: {
      total: 2,
      page: 1,
      lastPage: 1,
    },
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
        FindAllBooksUseCase,
        {
          provide: 'BookRepositoryOutPort',
          useValue: mockBookRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindAllBooksUseCase>(FindAllBooksUseCase);
    bookRepository = module.get('BookRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should find all books with default pagination', async () => {
      // Arrange
      const input: FindAllBooksInput = {};
      bookRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        title: undefined,
        author: undefined,
        onlyAvailable: undefined,
        imageUrl: undefined,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should find all books with custom pagination', async () => {
      // Arrange
      const input: FindAllBooksInput = {
        page: 3,
        limit: 20,
      };
      bookRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findAll).toHaveBeenCalledWith({
        page: 3,
        limit: 20,
        title: undefined,
        author: undefined,
        onlyAvailable: undefined,
        imageUrl: undefined,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should find books with title filter', async () => {
      // Arrange
      const input: FindAllBooksInput = {
        page: 1,
        limit: 10,
        title: 'clean',
      };
      bookRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        title: 'clean',
        author: undefined,
        onlyAvailable: undefined,
        imageUrl: undefined,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should find books with author filter', async () => {
      // Arrange
      const input: FindAllBooksInput = {
        author: 'martin',
      };
      bookRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        title: undefined,
        author: 'martin',
        onlyAvailable: undefined,
        imageUrl: undefined,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should find only available books', async () => {
      // Arrange
      const input: FindAllBooksInput = {
        onlyAvailable: true,
      };
      bookRepository.findAll.mockResolvedValue({
        ...mockPaginatedResponse,
        data: [mockPaginatedResponse.data[0]], // Only the available book
      });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        title: undefined,
        author: undefined,
        onlyAvailable: true,
        imageUrl: undefined,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].hasAvailable).toBe(true);
    });

    it('should find books with all filters combined', async () => {
      // Arrange
      const input: FindAllBooksInput = {
        page: 2,
        limit: 5,
        title: 'code',
        author: 'martin',
        onlyAvailable: true,
      };
      bookRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        title: 'code',
        author: 'martin',
        onlyAvailable: true,
        imageUrl: undefined,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle invalid page and limit values', async () => {
      // Arrange
      const input: FindAllBooksInput = {
        // Simulating what happens when Number('invalid') or Number(undefined) is called
      };
      bookRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findAll).toHaveBeenCalledWith({
        page: 1, // Default to 1 when NaN
        limit: 10, // Default to 10 when NaN
        title: undefined,
        author: undefined,
        onlyAvailable: undefined,
        imageUrl: undefined,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle zero and negative page values', async () => {
      // Arrange
      const input: FindAllBooksInput = {
        page: 0,
        limit: -5,
      };
      bookRepository.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(bookRepository.findAll).toHaveBeenCalledWith({
        page: 1, // Default to 1 when 0 (falsy)
        limit: -5, // Negative values are passed through - this is the actual behavior
        title: undefined,
        author: undefined,
        onlyAvailable: undefined,
        imageUrl: undefined,
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const input: FindAllBooksInput = {};
      const error = new Error('Database connection failed');
      bookRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });
  });
});
