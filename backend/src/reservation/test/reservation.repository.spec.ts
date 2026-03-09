import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationRepository } from '../repository/reservation.repository';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../enum/reservation-status.enum';

describe('ReservationRepository', () => {
  let repository: ReservationRepository;
  let typeOrmRepo: jest.Mocked<Repository<Reservation>>;

  const createQueryBuilderMock = (rawResult: any[] = [], count = 0) => {
    const qb: any = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      clone: jest.fn(),
      getCount: jest.fn().mockResolvedValue(count),
      getRawMany: jest.fn().mockResolvedValue(rawResult),
    };
    qb.clone.mockReturnValue({ ...qb, getCount: jest.fn().mockResolvedValue(count) });
    return qb;
  };

  const mockTypeOrmRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationRepository,
        { provide: getRepositoryToken(Reservation), useValue: mockTypeOrmRepo },
      ],
    }).compile();

    repository = module.get(ReservationRepository);
    typeOrmRepo = module.get(getRepositoryToken(Reservation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a reservation', async () => {
      const data = { id: 'res-1', status: ReservationStatus.ACTIVE } as Partial<Reservation>;
      const created = { ...data } as Reservation;
      mockTypeOrmRepo.create.mockReturnValue(created);
      mockTypeOrmRepo.save.mockResolvedValue(created);

      const result = await repository.create(data);

      expect(mockTypeOrmRepo.create).toHaveBeenCalledWith(data);
      expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('findById', () => {
    it('should return reservation by id', async () => {
      const reservation = { id: 'res-1' } as Reservation;
      mockTypeOrmRepo.findOneBy.mockResolvedValue(reservation);

      const result = await repository.findById('res-1');

      expect(mockTypeOrmRepo.findOneBy).toHaveBeenCalledWith({ id: 'res-1' });
      expect(result).toEqual(reservation);
    });

    it('should return null when not found', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdWithBookCopy', () => {
    it('should return reservation with bookCopy relation', async () => {
      const reservation = { id: 'res-1', bookCopy: { id: 'copy-1' } } as any;
      mockTypeOrmRepo.findOne.mockResolvedValue(reservation);

      const result = await repository.findByIdWithBookCopy('res-1');

      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'res-1' },
        relations: ['bookCopy'],
      });
      expect(result).toEqual(reservation);
    });
  });

  describe('save', () => {
    it('should save a reservation', async () => {
      const reservation = { id: 'res-1' } as Reservation;
      mockTypeOrmRepo.save.mockResolvedValue(reservation);

      const result = await repository.save(reservation);

      expect(mockTypeOrmRepo.save).toHaveBeenCalledWith(reservation);
      expect(result).toEqual(reservation);
    });
  });

  describe('remove', () => {
    it('should remove a reservation', async () => {
      const reservation = { id: 'res-1' } as Reservation;
      mockTypeOrmRepo.remove.mockResolvedValue(reservation);

      await repository.remove(reservation);

      expect(mockTypeOrmRepo.remove).toHaveBeenCalledWith(reservation);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const rawData = [
        {
          id: 'res-1',
          clientName: 'Mario',
          bookTitle: 'Clean Code',
          bookImage: null,
          author: 'Robert Martin',
          reservedAt: new Date('2026-03-01'),
          dueDate: new Date('2026-04-01'),
          returnedAt: null,
          status: ReservationStatus.ACTIVE,
          fineAmount: null,
        },
      ];

      const qb = createQueryBuilderMock(rawData, 1);
      mockTypeOrmRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(mockTypeOrmRepo.createQueryBuilder).toHaveBeenCalledWith('reservation');
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ total: 1, page: 1, lastPage: 1 });
      expect(result.data[0].id).toBe('res-1');
    });

    it('should apply clientId filter', async () => {
      const qb = createQueryBuilderMock([], 0);
      mockTypeOrmRepo.createQueryBuilder.mockReturnValue(qb);

      await repository.findAll({ page: 1, limit: 10, clientId: 'client-1' });

      expect(qb.andWhere).toHaveBeenCalledWith('client.id = :clientId', { clientId: 'client-1' });
    });

    it('should apply status filter', async () => {
      const qb = createQueryBuilderMock([], 0);
      mockTypeOrmRepo.createQueryBuilder.mockReturnValue(qb);

      await repository.findAll({ page: 1, limit: 10, status: 'ACTIVE' });

      expect(qb.andWhere).toHaveBeenCalledWith('reservation.status = :status', { status: 'ACTIVE' });
    });

    it('should apply overdueOnly filter', async () => {
      const qb = createQueryBuilderMock([], 0);
      mockTypeOrmRepo.createQueryBuilder.mockReturnValue(qb);

      await repository.findAll({ page: 1, limit: 10, overdueOnly: true });

      expect(qb.andWhere).toHaveBeenCalledWith('reservation.dueDate < :now', expect.any(Object));
      expect(qb.andWhere).toHaveBeenCalledWith('reservation.status != :returned', {
        returned: ReservationStatus.RETURNED,
      });
    });

    it('should calculate pagination correctly', async () => {
      const qb = createQueryBuilderMock([], 25);
      mockTypeOrmRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await repository.findAll({ page: 2, limit: 10 });

      expect(qb.limit).toHaveBeenCalledWith(10);
      expect(qb.offset).toHaveBeenCalledWith(10);
      expect(result.meta.lastPage).toBe(3);
    });
  });
});
