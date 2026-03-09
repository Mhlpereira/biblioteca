import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Book } from '../entities/book.entity';
import { BookRepository } from './book.repository';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { FindAllBooksOutput } from '../ports/out/find-all-books-output';
import { BookFilters } from '../interface/book-filters';

describe('BookRepository', () => {
  let repository: BookRepository;
  let typeormRepository: jest.Mocked<Repository<Book>>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Book>>;

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
    queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
    } as any;

    const mockTypeormRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookRepository,
        {
          provide: getRepositoryToken(Book),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    repository = module.get<BookRepository>(BookRepository);
    typeormRepository = module.get(getRepositoryToken(Book));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a book', async () => {

      const bookData: Partial<Book> = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: 'Clean Code',
        author: 'Robert Martin',
        imageUrl: 'image.png',
      };

      typeormRepository.create.mockReturnValue(mockBook);
      typeormRepository.save.mockResolvedValue(mockBook);


      const result = await repository.create(bookData);


      expect(typeormRepository.create).toHaveBeenCalledWith(bookData);
      expect(typeormRepository.save).toHaveBeenCalledWith(mockBook);
      expect(result).toEqual(mockBook);
    });
  });

  describe('findById', () => {
    it('should find a book by id', async () => {

      const bookId = '01HJQZ5R3N7MTXVGQE5J8K9M0P';
      typeormRepository.findOneBy.mockResolvedValue(mockBook);


      const result = await repository.findById(bookId);


      expect(typeormRepository.findOneBy).toHaveBeenCalledWith({ id: bookId });
      expect(result).toEqual(mockBook);
    });

    it('should return null when book is not found', async () => {

      const bookId = 'non-existent-id';
      typeormRepository.findOneBy.mockResolvedValue(null);


      const result = await repository.findById(bookId);


      expect(typeormRepository.findOneBy).toHaveBeenCalledWith({ id: bookId });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a book', async () => {

      const updatedBook = { ...mockBook, title: 'Updated Title' };
      typeormRepository.save.mockResolvedValue(updatedBook);


      const result = await repository.update(updatedBook);


      expect(typeormRepository.save).toHaveBeenCalledWith(updatedBook);
      expect(result).toEqual(updatedBook);
    });
  });

  describe('findAll', () => {
    const mockRawData = [
      {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
        title: 'Clean Code',
        author: 'Robert Martin',
        imageurl: 'image.png',
        totalcopies: '5',
        availablecopies: '3',
      },
    ];

    const filters: BookFilters = {
      page: 1,
      limit: 10,
    };

    beforeEach(() => {
      queryBuilder.getRawMany.mockResolvedValueOnce(mockRawData).mockResolvedValueOnce(mockRawData);
    });

    it('should return paginated books with all filters', async () => {

      const filtersWithAll: BookFilters = {
        ...filters,
        title: 'clean',
        author: 'martin',
        onlyAvailable: true,
      };


      const result = await repository.findAll(filtersWithAll);


      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(book.title) LIKE LOWER(:title)',
        { title: '%clean%' }
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(book.author) LIKE LOWER(:author)',
        { author: '%martin%' }
      );
      expect(queryBuilder.having).toHaveBeenCalled();
      expect(result.data).toEqual([
        {
          id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
          title: 'Clean Code',
          author: 'Robert Martin',
          imageUrl: 'image.png',
          totalCopies: 5,
          availableCopies: 3,
          hasAvailable: true,
        },
      ]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        lastPage: 1,
      });
    });

    it('should return paginated books without filters', async () => {

      const result = await repository.findAll(filters);


      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
      expect(queryBuilder.having).not.toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it('should handle books with no image URL', async () => {

      const mockDataWithoutImage = [{
        ...mockRawData[0],
        imageurl: null,
      }];
      queryBuilder.getRawMany.mockReset().mockResolvedValueOnce(mockDataWithoutImage).mockResolvedValueOnce(mockDataWithoutImage);


      const result = await repository.findAll(filters);


      expect(result.data[0].imageUrl).toBe('');
    });

    it('should calculate pagination correctly', async () => {

      const paginationFilters: BookFilters = {
        page: 2,
        limit: 5,
      };


      await repository.findAll(paginationFilters);


      expect(queryBuilder.limit).toHaveBeenCalledWith(5);
      expect(queryBuilder.offset).toHaveBeenCalledWith(5);
    });
  });
});
