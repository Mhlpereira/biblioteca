import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReturnBookUseCase } from './return-book.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { Reservation } from '../entities/reservation.entity';
import { ReturnBookInput } from '../ports/in/return-book.in';
import { FINE_RULES } from '../../common/constants/fine.constants';

describe('ReturnBookUseCase', () => {
  let useCase: ReturnBookUseCase;
  let reservationRepository: jest.Mocked<ReservationOutPort>;
  let bookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort>;

  const mockBookCopy = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
    book: {
      id: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      title: 'Clean Code',
      author: 'Robert Martin',
      imageUrl: 'image.png',
      active: true,
      copies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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

    const mockBookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort> = {
      addCopies: jest.fn(),
      findByIdWithBook: jest.fn(),
      findAvailableByBookId: jest.fn(),
      updateStatus: jest.fn(),
      findAllByBook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnBookUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
        { provide: 'BookCopyRepositoryOutPort', useValue: mockBookCopyRepository },
      ],
    }).compile();

    useCase = module.get<ReturnBookUseCase>(ReturnBookUseCase);
    reservationRepository = module.get('ReservationOutPort');
    bookCopyRepository = module.get('BookCopyRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a book successfully', async () => {
      const input: ReturnBookInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      const activeReservation = { ...mockReservation, status: ReservationStatus.ACTIVE } as unknown as Reservation;
      const savedReservation = {
        ...activeReservation,
        status: ReservationStatus.RETURNED,
        returnedAt: expect.any(Date),
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(activeReservation);
      reservationRepository.save.mockResolvedValue(savedReservation);

      const result = await useCase.execute(input);

      expect(reservationRepository.findByIdWithBookCopy).toHaveBeenCalledWith(input.id);
      expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(mockBookCopy.id, BookCopyStatus.AVAILABLE);
      expect(reservationRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(savedReservation.id);
      expect(result.status).toBe(ReservationStatus.RETURNED);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      const input: ReturnBookInput = { id: 'non-existent-id' };

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
      expect(reservationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when book already returned', async () => {
      const input: ReturnBookInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      const returnedReservation = {
        ...mockReservation,
        status: ReservationStatus.RETURNED,
        returnedAt: new Date(),
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(returnedReservation);

      await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
      expect(reservationRepository.save).not.toHaveBeenCalled();
    });

    it('should calculate fine for overdue books', async () => {
      const input: ReturnBookInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      const overdueReservation = {
        ...mockReservation,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: ReservationStatus.ACTIVE,
        bookCopy: mockBookCopy,
      } as unknown as Reservation;

      const savedReservation = {
        ...overdueReservation,
        status: ReservationStatus.RETURNED,
        returnedAt: new Date(),
        daysLate: expect.any(Number),
        fineAmount: expect.any(Number),
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(overdueReservation);
      reservationRepository.save.mockResolvedValue(savedReservation);

      await useCase.execute(input);

      const savedArg = reservationRepository.save.mock.calls[0][0];
      expect(savedArg.daysLate).toBeGreaterThan(0);
      expect(savedArg.fineAmount).toBeGreaterThan(0);
    });

    it('should not calculate fine for on-time returns', async () => {
      const input: ReturnBookInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      const onTimeReservation = {
        ...mockReservation,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: ReservationStatus.ACTIVE,
        bookCopy: mockBookCopy,
        daysLate: 0,
        fineAmount: 0,
      } as unknown as Reservation;

      const savedReservation = {
        ...onTimeReservation,
        status: ReservationStatus.RETURNED,
        returnedAt: new Date(),
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(onTimeReservation);
      reservationRepository.save.mockResolvedValue(savedReservation);

      await useCase.execute(input);

      const savedArg = reservationRepository.save.mock.calls[0][0];
      expect(savedArg.fineAmount).toBe(0);
    });

    it('should update book copy status to AVAILABLE', async () => {
      const input: ReturnBookInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      const activeReservation = {
        ...mockReservation,
        status: ReservationStatus.ACTIVE,
        bookCopy: mockBookCopy,
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(activeReservation);
      reservationRepository.save.mockResolvedValue({ ...activeReservation, status: ReservationStatus.RETURNED } as unknown as Reservation);

      await useCase.execute(input);

      expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(mockBookCopy.id, BookCopyStatus.AVAILABLE);
    });

    it('should not update book copy when bookCopy is null', async () => {
      const input: ReturnBookInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      const reservationNoCopy = {
        ...mockReservation,
        bookCopy: null,
        status: ReservationStatus.ACTIVE,
      } as unknown as Reservation;

      const savedReservation = {
        ...reservationNoCopy,
        status: ReservationStatus.RETURNED,
        returnedAt: new Date(),
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(reservationNoCopy);
      reservationRepository.save.mockResolvedValue(savedReservation);

      await useCase.execute(input);

      expect(bookCopyRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should set returnedAt to current date', async () => {
      const input: ReturnBookInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      const activeReservation = {
        ...mockReservation,
        status: ReservationStatus.ACTIVE,
        bookCopy: mockBookCopy,
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(activeReservation);
      reservationRepository.save.mockImplementation(async (r) => r);

      const before = new Date();
      await useCase.execute(input);
      const after = new Date();

      const savedArg = reservationRepository.save.mock.calls[0][0];
      expect(savedArg.returnedAt).toBeDefined();
      expect(savedArg.returnedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(savedArg.returnedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should propagate repository errors', async () => {
      const input: ReturnBookInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      reservationRepository.findByIdWithBookCopy.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(input)).rejects.toThrow('Database error');
    });
  });
});
