import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateReservationUseCase } from './update-reservation.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { Reservation } from '../entities/reservation.entity';
import { UpdateReservationInput } from '../ports/in/update-reservation.in';

describe('UpdateReservationUseCase', () => {
  let useCase: UpdateReservationUseCase;
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
        UpdateReservationUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
        { provide: 'BookCopyRepositoryOutPort', useValue: mockBookCopyRepository },
      ],
    }).compile();

    useCase = module.get<UpdateReservationUseCase>(UpdateReservationUseCase);
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
    it('should update a reservation successfully', async () => {
      const input: UpdateReservationInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        daysLate: 3,
        fineAmount: 15,
      };

      const updatedReservation = {
        ...mockReservation,
        daysLate: 3,
        fineAmount: 15,
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue({ ...mockReservation } as unknown as Reservation);
      reservationRepository.save.mockResolvedValue(updatedReservation);

      const result = await useCase.execute(input);

      expect(reservationRepository.findByIdWithBookCopy).toHaveBeenCalledWith(input.id);
      expect(reservationRepository.save).toHaveBeenCalled();
      expect(result.daysLate).toBe(3);
      expect(result.fineAmount).toBe(15);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      const input: UpdateReservationInput = {
        id: 'non-existent-id',
      };

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
      expect(reservationRepository.save).not.toHaveBeenCalled();
    });

    it('should update status field', async () => {
      const input: UpdateReservationInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        status: ReservationStatus.CANCELED,
      };

      const updatedReservation = {
        ...mockReservation,
        status: ReservationStatus.CANCELED,
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue({ ...mockReservation } as unknown as Reservation);
      reservationRepository.save.mockResolvedValue(updatedReservation);

      const result = await useCase.execute(input);

      expect(result.status).toBe(ReservationStatus.CANCELED);
    });

    it('should update returnedAt field', async () => {
      const returnedAt = new Date();
      const input: UpdateReservationInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        returnedAt,
      };

      const updatedReservation = {
        ...mockReservation,
        returnedAt,
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue({ ...mockReservation } as unknown as Reservation);
      reservationRepository.save.mockResolvedValue(updatedReservation);

      const result = await useCase.execute(input);

      expect(result.returnedAt).toBe(returnedAt);
    });

    it('should update book copy to AVAILABLE when status is RETURNED', async () => {
      const input: UpdateReservationInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        status: ReservationStatus.RETURNED,
      };

      const updatedReservation = {
        ...mockReservation,
        status: ReservationStatus.RETURNED,
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue({ ...mockReservation } as unknown as Reservation);
      reservationRepository.save.mockResolvedValue(updatedReservation);

      await useCase.execute(input);

      expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(mockBookCopy.id, BookCopyStatus.AVAILABLE);
    });

    it('should not update book copy status when status is not RETURNED', async () => {
      const input: UpdateReservationInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        daysLate: 2,
      };

      reservationRepository.findByIdWithBookCopy.mockResolvedValue({ ...mockReservation } as unknown as Reservation);
      reservationRepository.save.mockResolvedValue({ ...mockReservation, daysLate: 2 } as unknown as Reservation);

      await useCase.execute(input);

      expect(bookCopyRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should not update book copy when bookCopy is null and status is RETURNED', async () => {
      const input: UpdateReservationInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        status: ReservationStatus.RETURNED,
      };

      const reservationNoCopy = {
        ...mockReservation,
        bookCopy: null,
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(reservationNoCopy);
      reservationRepository.save.mockResolvedValue({
        ...reservationNoCopy,
        status: ReservationStatus.RETURNED,
      } as unknown as Reservation);

      await useCase.execute(input);

      expect(bookCopyRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should map output fields correctly', async () => {
      const input: UpdateReservationInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
      };

      reservationRepository.findByIdWithBookCopy.mockResolvedValue({ ...mockReservation } as unknown as Reservation);
      reservationRepository.save.mockResolvedValue(mockReservation);

      const result = await useCase.execute(input);

      expect(result.id).toBe(mockReservation.id);
      expect(result.keycloackClientId).toBe(mockReservation.keycloackClientId);
      expect(result.bookCopyId).toBe(mockBookCopy.id);
      expect(result.reservedAt).toBe(mockReservation.reservedAt);
      expect(result.dueDate).toBe(mockReservation.dueDate);
      expect(result.status).toBe(mockReservation.status);
    });

    it('should propagate repository errors', async () => {
      const input: UpdateReservationInput = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
      };

      reservationRepository.findByIdWithBookCopy.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(input)).rejects.toThrow('Database error');
    });
  });
});
