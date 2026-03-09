import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopyRepository } from './book-copy.repository';
import { BookCopy } from '../entities/book-copy.entity';
import { Book } from '../../book/entities/book.entity';
import { BookCopyStatus } from '../enum/book-status.enum';

describe('BookCopyRepository', () => {
  let repository: BookCopyRepository;
  let typeormRepository: jest.Mocked<Repository<BookCopy>>;

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
    const mockTypeormRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      findAndCount: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookCopyRepository,
        {
          provide: getRepositoryToken(BookCopy),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<BookCopyRepository>(BookCopyRepository);
    typeormRepository = module.get(getRepositoryToken(BookCopy));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('addCopies', () => {
    it('should create and save multiple book copies', async () => {
      // Arrange
      const quantity = 3;
      const mockCopies = [
        { ...mockBookCopy, id: '01HJQZ5R3N7MTXVGQE5J8K9M0Q' },
        { ...mockBookCopy, id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' },
        { ...mockBookCopy, id: '01HJQZ5R3N7MTXVGQE5J8K9M0S' },
      ];

      typeormRepository.create.mockReturnValueOnce(mockCopies[0] as any)
        .mockReturnValueOnce(mockCopies[1] as any)
        .mockReturnValueOnce(mockCopies[2] as any);
      typeormRepository.save.mockResolvedValue(mockCopies as any);

      // Act
      const result = await repository.addCopies(mockBook, quantity);

      // Assert
      expect(typeormRepository.create).toHaveBeenCalledTimes(quantity);
      expect(typeormRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        book: mockBook,
        status: BookCopyStatus.AVAILABLE,
      });
      expect(typeormRepository.save).toHaveBeenCalledWith(mockCopies);
      expect(result).toEqual(mockCopies);
    });

    it('should create zero copies when quantity is 0', async () => {
      // Arrange
      const quantity = 0;
      typeormRepository.save.mockResolvedValue([] as any);

      // Act
      const result = await repository.addCopies(mockBook, quantity);

      // Assert
      expect(typeormRepository.create).not.toHaveBeenCalled();
      expect(typeormRepository.save).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('should generate ULID for each copy', async () => {
      // Arrange
      const quantity = 2;
      typeormRepository.create.mockReturnValue(mockBookCopy);
      typeormRepository.save.mockResolvedValue([mockBookCopy, mockBookCopy] as any);

      // Act
      await repository.addCopies(mockBook, quantity);

      // Assert
      const createCalls = typeormRepository.create.mock.calls;
      expect(createCalls).toHaveLength(quantity);
      createCalls.forEach(call => {
        const copyData = call[0] as any;
        expect(copyData.id).toBeDefined();
        expect(typeof copyData.id).toBe('string');
        expect(copyData.id.length).toBe(26); // ULID length
      });
    });
  });

  describe('findByIdWithBook', () => {
    it('should find book copy with book relation', async () => {
      // Arrange
      const copyId = '01HJQZ5R3N7MTXVGQE5J8K9M0Q';
      typeormRepository.findOne.mockResolvedValue(mockBookCopy);

      // Act
      const result = await repository.findByIdWithBook(copyId);

      // Assert
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: copyId },
        relations: ['book'],
      });
      expect(result).toEqual(mockBookCopy);
    });

    it('should return null when copy is not found', async () => {
      // Arrange
      const copyId = 'non-existent-id';
      typeormRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findByIdWithBook(copyId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAvailableByBookId', () => {
    it('should find available copy for book', async () => {
      // Arrange
      const bookId = '01HJQZ5R3N7MTXVGQE5J8K9M0P';
      typeormRepository.findOne.mockResolvedValue(mockBookCopy);

      // Act
      const result = await repository.findAvailableByBookId(bookId);

      // Assert
      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: {
          book: { id: bookId },
          status: BookCopyStatus.AVAILABLE,
        },
      });
      expect(result).toEqual(mockBookCopy);
    });

    it('should return null when no available copy is found', async () => {
      // Arrange
      const bookId = '01HJQZ5R3N7MTXVGQE5J8K9M0P';
      typeormRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findAvailableByBookId(bookId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update copy status', async () => {
      // Arrange
      const copyId = '01HJQZ5R3N7MTXVGQE5J8K9M0Q';
      const newStatus = BookCopyStatus.RESERVED;
      typeormRepository.update.mockResolvedValue(undefined as any);

      // Act
      await repository.updateStatus(copyId, newStatus);

      // Assert
      expect(typeormRepository.update).toHaveBeenCalledWith(
        { id: copyId },
        { status: newStatus }
      );
    });

    it('should handle different status types', async () => {
      // Arrange
      const copyId = '01HJQZ5R3N7MTXVGQE5J8K9M0Q';
      const statuses = [BookCopyStatus.AVAILABLE, BookCopyStatus.RESERVED, BookCopyStatus.REMOVED];

      for (const status of statuses) {
        typeormRepository.update.mockResolvedValue(undefined as any);

        // Act
        await repository.updateStatus(copyId, status);

        // Assert
        expect(typeormRepository.update).toHaveBeenCalledWith(
          { id: copyId },
          { status }
        );

        jest.clearAllMocks();
      }
    });
  });

  describe('findAllByBook', () => {
    it('should return paginated book copies for a book', async () => {
      // Arrange
      const bookId = '01HJQZ5R3N7MTXVGQE5J8K9M0P';
      const mockCopies = [mockBookCopy];
      const total = 1;
      typeormRepository.findAndCount.mockResolvedValue([mockCopies, total]);

      // Act
      const result = await repository.findAllByBook(bookId);

      // Assert
      expect(typeormRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          book: { id: bookId },
        },
        relations: {
          book: true,
        },
      });
      expect(result).toEqual({
        data: mockCopies,
        meta: {
          total,
          page: 1,
          lastPage: 1,
        },
      });
    });

    it('should return empty result when no copies found', async () => {
      // Arrange
      const bookId = '01HJQZ5R3N7MTXVGQE5J8K9M0P';
      typeormRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await repository.findAllByBook(bookId);

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
  });
});
