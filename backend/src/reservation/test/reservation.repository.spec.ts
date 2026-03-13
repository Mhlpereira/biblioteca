import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationRepository } from '../repository/reservation.repository';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { ReservationFilters } from '../ports/in/reservation-filters.in';
import { ConfigService } from '@nestjs/config';

describe('ReservationRepository', () => {
  let repository: ReservationRepository;
  let ormRepository: jest.Mocked<Repository<Reservation>>;

  const mockBook = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
    title: 'Clean Code',
    author: 'Robert Martin',
    imageUrl: 'image.png',
    active: true,
    copies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBookCopy = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
    book: mockBook,
    status: BookCopyStatus.RESERVED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReservation = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
    keycloackClientId: 'user-123',
    bookCopy: mockBookCopy,
    reservedAt: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: ReservationStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Reservation;

  beforeEach(async () => {
    const mockOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationRepository,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockOrmRepository,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
      ],
    }).compile();

    repository = module.get<ReservationRepository>(ReservationRepository);
    ormRepository = module.get(getRepositoryToken(Reservation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a reservation', async () => {
      ormRepository.create.mockReturnValue(mockReservation);
      ormRepository.save.mockResolvedValue(mockReservation);

      const result = await repository.create({ ...mockReservation });

      expect(ormRepository.create).toHaveBeenCalled();
      expect(ormRepository.save).toHaveBeenCalledWith(mockReservation);
      expect(result).toEqual(mockReservation);
    });
  });

  describe('findById', () => {
    it('should find a reservation by id', async () => {
      ormRepository.findOne.mockResolvedValue(mockReservation);

      const result = await repository.findById(mockReservation.id);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ where: { id: mockReservation.id } });
      expect(result).toEqual(mockReservation);
    });

    it('should return null when reservation is not found', async () => {
      ormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find reservations by user id', async () => {
      const reservations = [mockReservation];
      ormRepository.find.mockResolvedValue(reservations);

      const result = await repository.findByUserId('user-123');

      expect(ormRepository.find).toHaveBeenCalledWith({
        where: { keycloackClientId: 'user-123' },
        relations: ['bookCopy', 'bookCopy.book'],
      });
      expect(result.data).toEqual(reservations);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.lastPage).toBe(1);
    });

    it('should return empty result when no reservations found', async () => {
      ormRepository.find.mockResolvedValue([]);

      const result = await repository.findByUserId('user-456');

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findByIdWithBookCopy', () => {
    it('should find a reservation with book copy relation', async () => {
      ormRepository.findOne.mockResolvedValue(mockReservation);

      const result = await repository.findByIdWithBookCopy(mockReservation.id);

      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockReservation.id },
        relations: ['bookCopy', 'bookCopy.book'],
      });
      expect(result).toEqual(mockReservation);
    });

    it('should return null when reservation is not found', async () => {
      ormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByIdWithBookCopy('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save a reservation', async () => {
      ormRepository.save.mockResolvedValue(mockReservation);

      const result = await repository.save(mockReservation);

      expect(ormRepository.save).toHaveBeenCalledWith(mockReservation);
      expect(result).toEqual(mockReservation);
    });
  });

  describe('remove', () => {
    it('should remove a reservation', async () => {
      ormRepository.remove.mockResolvedValue(mockReservation);

      await repository.remove(mockReservation);

      expect(ormRepository.remove).toHaveBeenCalledWith(mockReservation);
    });
  });

  describe('findAll', () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
      getMany: jest.fn(),
    };

    beforeEach(() => {
      ormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as never);
    });

    it('should find all reservations with pagination', async () => {
      const filters: ReservationFilters = { page: 1, limit: 10 };
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockReservation]);

      const result = await repository.findAll(filters);

      expect(ormRepository.createQueryBuilder).toHaveBeenCalledWith('reservation');
      expect(result.data).toEqual([mockReservation]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.lastPage).toBe(1);
    });

    it('should apply clientId filter', async () => {
      const filters: ReservationFilters = { page: 1, limit: 10, clientId: 'user-123' };
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.keycloackClientId = :clientId',
        { clientId: 'user-123' },
      );
    });

    it('should apply bookId filter', async () => {
      const filters: ReservationFilters = { page: 1, limit: 10, bookId: 'book-123' };
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'book.id = :bookId',
        { bookId: 'book-123' },
      );
    });

    it('should apply status filter', async () => {
      const filters: ReservationFilters = { page: 1, limit: 10, status: ReservationStatus.ACTIVE };
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.status = :status',
        { status: ReservationStatus.ACTIVE },
      );
    });

    it('should apply overdueOnly filter', async () => {
      const filters: ReservationFilters = { page: 1, limit: 10, overdueOnly: true };
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.dueDate < :now',
        expect.objectContaining({ now: expect.any(Date) }),
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.status != :returned',
        { returned: ReservationStatus.RETURNED },
      );
    });

    it('should apply reservedAt filter', async () => {
      const filters: ReservationFilters = { page: 1, limit: 10, reservedAt: '2025-01-01' };
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.reservedAt >= :reservedAt',
        { reservedAt: new Date('2025-01-01') },
      );
    });

    it('should apply dueDate filter', async () => {
      const filters: ReservationFilters = { page: 1, limit: 10, dueDate: '2025-12-31' };
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.dueDate <= :dueDate',
        { dueDate: new Date('2025-12-31') },
      );
    });

    it('should apply returnedAt filter', async () => {
      const filters: ReservationFilters = { page: 1, limit: 10, returnedAt: '2025-06-15' };
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await repository.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'reservation.returnedAt <= :returnedAt',
        { returnedAt: new Date('2025-06-15') },
      );
    });

    it('should calculate lastPage correctly', async () => {
      const filters: ReservationFilters = { page: 1, limit: 5 };
      mockQueryBuilder.getCount.mockResolvedValue(12);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await repository.findAll(filters);

      expect(result.meta.lastPage).toBe(3);
    });
  });

  describe('findAll (Elasticsearch path)', () => {
    const mockFetch = jest.fn();
    let repositoryWithElastic: ReservationRepository;
    let ormRepositoryWithElastic: jest.Mocked<Repository<Reservation>>;

    const elasticHit = {
      _source: {
        reservation_id: 'es-res-id',
        keycloackClientId: 'user-es',
        reservedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        returnedAt: null,
        status: ReservationStatus.ACTIVE,
        fineAmount: null,
        daysLate: null,
        bookCopyId: 'copy-es',
        bookId: 'book-es',
        bookTitle: 'ES Book',
        bookAuthor: 'ES Author',
        bookImageUrl: 'http://img.es/img.png',
      },
    };

    const makeElasticResponse = (hits: unknown[], total = hits.length) => ({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        hits: {
          total: { value: total },
          hits,
        },
      }),
      text: jest.fn(),
    });

    beforeEach(async () => {
      global.fetch = mockFetch;

      const mockOrmRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(),
      };

      const module = await Test.createTestingModule({
        providers: [
          ReservationRepository,
          {
            provide: getRepositoryToken(Reservation),
            useValue: mockOrmRepository,
          },
          {
            provide: ConfigService,
            useValue: { get: jest.fn().mockReturnValue('http://elasticsearch:9200') },
          },
        ],
      }).compile();

      repositoryWithElastic = module.get<ReservationRepository>(ReservationRepository);
      ormRepositoryWithElastic = module.get(getRepositoryToken(Reservation));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return results from Elasticsearch when available', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([elasticHit]));

      const filters: ReservationFilters = { page: 1, limit: 10 };
      const result = await repositoryWithElastic.findAll(filters);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('es-res-id');
      expect(result.meta.total).toBe(1);
    });

    it('should fall back to DB when Elasticsearch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockReservation]),
      };
      ormRepositoryWithElastic.createQueryBuilder.mockReturnValue(mockQb as never);

      const filters: ReservationFilters = { page: 1, limit: 10 };
      const result = await repositoryWithElastic.findAll(filters);

      expect(result.data).toEqual([mockReservation]);
    });

    it('should throw when ELASTIC_URL is not configured', async () => {
      const module = await Test.createTestingModule({
        providers: [
          ReservationRepository,
          {
            provide: getRepositoryToken(Reservation),
            useValue: { createQueryBuilder: jest.fn() },
          },
          {
            provide: ConfigService,
            useValue: { get: jest.fn().mockReturnValue(undefined) },
          },
        ],
      }).compile();

      const repoNoElastic = module.get<ReservationRepository>(ReservationRepository);
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      };
      module.get(getRepositoryToken(Reservation)).createQueryBuilder.mockReturnValue(mockQb as never);

      const result = await repoNoElastic.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual([]);
    });

    it('should apply search filter in Elasticsearch query', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([]));

      await repositoryWithElastic.findAll({ page: 1, limit: 10, search: 'clean code' });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.bool.must[0]).toMatchObject({
        multi_match: { query: 'clean code' },
      });
    });

    it('should apply clientId filter in Elasticsearch query', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([]));

      await repositoryWithElastic.findAll({ page: 1, limit: 10, clientId: 'user-123' });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.bool.filter).toContainEqual({ term: { keycloackClientId: 'user-123' } });
    });

    it('should apply bookId filter in Elasticsearch query', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([]));

      await repositoryWithElastic.findAll({ page: 1, limit: 10, bookId: 'book-abc' });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.bool.filter).toContainEqual({ term: { bookId: 'book-abc' } });
    });

    it('should apply status filter in Elasticsearch query', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([]));

      await repositoryWithElastic.findAll({ page: 1, limit: 10, status: ReservationStatus.RETURNED });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.bool.filter).toContainEqual({ term: { status: ReservationStatus.RETURNED } });
    });

    it('should apply overdueOnly filter in Elasticsearch query', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([]));

      await repositoryWithElastic.findAll({ page: 1, limit: 10, overdueOnly: true });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.bool.must_not).toContainEqual({ term: { status: ReservationStatus.RETURNED } });
      expect(body.query.bool.filter.some((f: any) => f.range?.dueDate?.lt)).toBe(true);
    });

    it('should apply reservedAt filter in Elasticsearch query', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([]));

      await repositoryWithElastic.findAll({ page: 1, limit: 10, reservedAt: '2025-01-01' });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.bool.filter).toContainEqual({ range: { reservedAt: { gte: '2025-01-01' } } });
    });

    it('should apply dueDate filter in Elasticsearch query', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([]));

      await repositoryWithElastic.findAll({ page: 1, limit: 10, dueDate: '2025-12-31' });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.bool.filter).toContainEqual({ range: { dueDate: { lte: '2025-12-31' } } });
    });

    it('should apply returnedAt filter in Elasticsearch query', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([]));

      await repositoryWithElastic.findAll({ page: 1, limit: 10, returnedAt: '2025-06-01' });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query.bool.filter).toContainEqual({ range: { returnedAt: { lte: '2025-06-01' } } });
    });

    it('should throw error when Elasticsearch returns non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([mockReservation]),
      };
      ormRepositoryWithElastic.createQueryBuilder.mockReturnValue(mockQb as never);

      const result = await repositoryWithElastic.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual([mockReservation]);
    });

    it('should handle numeric total from Elasticsearch', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          hits: {
            total: 5,
            hits: [],
          },
        }),
      });

      const result = await repositoryWithElastic.findAll({ page: 1, limit: 10 });
      expect(result.meta.total).toBe(5);
    });

    it('should skip hits with null _source', async () => {
      const hitWithNull = { _source: null };
      mockFetch.mockResolvedValue(makeElasticResponse([hitWithNull, elasticHit], 2));

      const result = await repositoryWithElastic.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('es-res-id');
    });

    it('should skip hits with missing id in _source', async () => {
      const hitNoId = { _source: { reservedAt: new Date().toISOString(), dueDate: new Date().toISOString() } };
      mockFetch.mockResolvedValue(makeElasticResponse([hitNoId], 1));

      const result = await repositoryWithElastic.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
    });

    it('should skip hits with missing dates in _source', async () => {
      const hitNoDates = { _source: { reservation_id: 'id-with-no-dates' } };
      mockFetch.mockResolvedValue(makeElasticResponse([hitNoDates], 1));

      const result = await repositoryWithElastic.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
    });

    it('should use pagination offset in Elasticsearch query', async () => {
      mockFetch.mockResolvedValue(makeElasticResponse([]));

      await repositoryWithElastic.findAll({ page: 3, limit: 5 });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.from).toBe(10);
      expect(body.size).toBe(5);
    });
  });
});

