import { Test, TestingModule } from '@nestjs/testing';
import { FindByUserIdReservationUseCase } from './find-by-user-id-reservation.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { Reservation } from '../entities/reservation.entity';

describe('FindByUserIdReservationUseCase', () => {
  let useCase: FindByUserIdReservationUseCase;
  let reservationRepository: jest.Mocked<ReservationOutPort>;

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

  const now = new Date();

  const mockActiveReservation = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
    keycloackClientId: 'user-123',
    bookCopy: mockBookCopy,
    reservedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
    status: ReservationStatus.ACTIVE,
    fineAmount: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Reservation;

  const mockOverdueReservation = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0S',
    keycloackClientId: 'user-123',
    bookCopy: mockBookCopy,
    reservedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    status: ReservationStatus.ACTIVE,
    fineAmount: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Reservation;

  const mockReturnedReservation = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0T',
    keycloackClientId: 'user-123',
    bookCopy: mockBookCopy,
    reservedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    returnedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    status: ReservationStatus.RETURNED,
    fineAmount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Reservation;

  beforeEach(async () => {
    const mockReservationRepository: jest.Mocked<ReservationOutPort> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByIdWithBookCopy: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByUserIdReservationUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
      ],
    }).compile();

    useCase = module.get<FindByUserIdReservationUseCase>(FindByUserIdReservationUseCase);
    reservationRepository = module.get('ReservationOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user reservations successfully', async () => {
      reservationRepository.findAll.mockResolvedValue({
        data: [mockActiveReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute('user-123');

      expect(reservationRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        clientId: 'user-123',
        bookId: undefined,
        status: undefined,
        overdueOnly: undefined,
      });
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe(mockActiveReservation.id);
    });

    it('should return empty list when no reservations found', async () => {
      reservationRepository.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute('user-999');

      expect(result).toEqual({
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 },
      });
    });

    it('should return empty list when result is null', async () => {
      reservationRepository.findAll.mockResolvedValue(null as never);

      const result = await useCase.execute('user-999');

      expect(result).toEqual({
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 },
      });
    });

    it('should mark overdue reservations correctly', async () => {
      reservationRepository.findAll.mockResolvedValue({
        data: [mockOverdueReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute('user-123');

      expect(result.data[0].isOverdue).toBe(true);
      expect(result.data[0].potentialFine).toBeGreaterThan(0);
    });

    it('should not mark returned reservations as overdue', async () => {
      reservationRepository.findAll.mockResolvedValue({
        data: [mockReturnedReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute('user-123');

      expect(result.data[0].isOverdue).toBe(false);
      expect(result.data[0].potentialFine).toBeNull();
    });

    it('should not mark active non-overdue reservations as overdue', async () => {
      reservationRepository.findAll.mockResolvedValue({
        data: [mockActiveReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute('user-123');

      expect(result.data[0].isOverdue).toBe(false);
      expect(result.data[0].potentialFine).toBeNull();
    });

    it('should map reservation fields correctly', async () => {
      reservationRepository.findAll.mockResolvedValue({
        data: [mockActiveReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute('user-123');
      const item = result.data[0];

      expect(item.id).toBe(mockActiveReservation.id);
      expect(item.bookTitle).toBe(mockBook.title);
      expect(item.bookImage).toBe(mockBook.imageUrl);
      expect(item.status).toBe(ReservationStatus.ACTIVE);
      expect(item.returnedAt).toBeNull();
    });

    it('should return meta information', async () => {
      reservationRepository.findAll.mockResolvedValue({
        data: [mockActiveReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute('user-123');

      expect(result.meta).toEqual({ total: 1, page: 1, lastPage: 1 });
    });

    it('should propagate repository errors', async () => {
      reservationRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute('user-123')).rejects.toThrow('Database error');
    });
  });
});
