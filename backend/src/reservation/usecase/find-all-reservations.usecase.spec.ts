import { Test, TestingModule } from '@nestjs/testing';
import { FindAllReservationsUseCase } from './find-all-reservations.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { Reservation } from '../entities/reservation.entity';
import { FindReservationInput } from '../ports/in/find-reservation.in';
import { FINE_RULES } from '../../common/constants/fine.constants';

describe('FindAllReservationsUseCase', () => {
  let useCase: FindAllReservationsUseCase;
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
    daysLate: 0,
    fineAmount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Reservation;

  const mockOverdueReservation = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0S',
    keycloackClientId: 'user-456',
    bookCopy: mockBookCopy,
    reservedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    status: ReservationStatus.ACTIVE,
    daysLate: 5,
    fineAmount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Reservation;

  const mockReturnedReservation = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0T',
    keycloackClientId: 'user-789',
    bookCopy: mockBookCopy,
    reservedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    returnedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    status: ReservationStatus.RETURNED,
    daysLate: 0,
    fineAmount: 0,
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
        FindAllReservationsUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
      ],
    }).compile();

    useCase = module.get<FindAllReservationsUseCase>(FindAllReservationsUseCase);
    reservationRepository = module.get('ReservationOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated reservations', async () => {
      const input: FindReservationInput = { page: 1, limit: 10 };

      reservationRepository.findAll.mockResolvedValue({
        data: [mockActiveReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute(input);

      expect(reservationRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        limit: 10,
      }));
      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
    });

    it('should use default page and limit when not provided', async () => {
      const input: FindReservationInput = {};

      reservationRepository.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 },
      });

      await useCase.execute(input);

      expect(reservationRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        limit: 10,
      }));
    });

    it('should mark overdue reservations correctly', async () => {
      const input: FindReservationInput = { page: 1, limit: 10 };

      reservationRepository.findAll.mockResolvedValue({
        data: [mockOverdueReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute(input);

      expect(result.data[0].isOverdue).toBe(true);
      expect(result.data[0].potentialFine).toBeGreaterThan(0);
    });

    it('should not mark returned reservations as overdue', async () => {
      const input: FindReservationInput = { page: 1, limit: 10 };

      reservationRepository.findAll.mockResolvedValue({
        data: [mockReturnedReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute(input);

      expect(result.data[0].isOverdue).toBe(false);
      expect(result.data[0].potentialFine).toBe(0);
    });

    it('should not mark active non-overdue reservations as overdue', async () => {
      const input: FindReservationInput = { page: 1, limit: 10 };

      reservationRepository.findAll.mockResolvedValue({
        data: [mockActiveReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute(input);

      expect(result.data[0].isOverdue).toBe(false);
      expect(result.data[0].potentialFine).toBe(0);
    });

    it('should map reservation fields correctly', async () => {
      const input: FindReservationInput = { page: 1, limit: 10 };

      reservationRepository.findAll.mockResolvedValue({
        data: [mockActiveReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute(input);
      const item = result.data[0];

      expect(item.id).toBe(mockActiveReservation.id);
      expect(item.clientName).toBe(mockActiveReservation.keycloackClientId);
      expect(item.bookTitle).toBe(mockBook.title);
      expect(item.bookImage).toBe(mockBook.imageUrl);
      expect(item.author).toBe(mockBook.author);
      expect(item.status).toBe(ReservationStatus.ACTIVE);
    });

    it('should pass filters to repository', async () => {
      const input: FindReservationInput = {
        page: 2,
        limit: 5,
        clientId: 'user-123',
        bookId: 'book-123',
        status: ReservationStatus.ACTIVE,
        overdueOnly: true,
      };

      reservationRepository.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 2, lastPage: 1 },
      });

      await useCase.execute(input);

      expect(reservationRepository.findAll).toHaveBeenCalledWith(expect.objectContaining({
        page: 2,
        limit: 5,
        clientId: 'user-123',
        bookId: 'book-123',
        status: ReservationStatus.ACTIVE,
        overdueOnly: true,
      }));
    });

    it('should handle null returnedAt correctly', async () => {
      const input: FindReservationInput = { page: 1, limit: 10 };

      reservationRepository.findAll.mockResolvedValue({
        data: [mockActiveReservation],
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute(input);

      expect(result.data[0].returnedAt).toBeNull();
    });

    it('should return empty data when no reservations found', async () => {
      const input: FindReservationInput = { page: 1, limit: 10 };

      reservationRepository.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 },
      });

      const result = await useCase.execute(input);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should propagate repository errors', async () => {
      const input: FindReservationInput = { page: 1, limit: 10 };

      reservationRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(input)).rejects.toThrow('Database error');
    });
  });
});
