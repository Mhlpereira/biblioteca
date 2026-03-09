import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindByIdReservationUseCase } from './find-by-id-reservation.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { Reservation } from '../entities/reservation.entity';

describe('FindByIdReservationUseCase', () => {
  let useCase: FindByIdReservationUseCase;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByIdReservationUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
      ],
    }).compile();

    useCase = module.get<FindByIdReservationUseCase>(FindByIdReservationUseCase);
    reservationRepository = module.get('ReservationOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return reservation by id', async () => {
      reservationRepository.findByIdWithBookCopy.mockResolvedValue(mockReservation);

      const result = await useCase.execute(mockReservation.id);

      expect(reservationRepository.findByIdWithBookCopy).toHaveBeenCalledWith(mockReservation.id);
      expect(result.id).toBe(mockReservation.id);
      expect(result.keycloackClientId).toBe('user-123');
      expect(result.bookCopyId).toBe(mockBookCopy.id);
      expect(result.bookTitle).toBe(mockBook.title);
      expect(result.bookImage).toBe(mockBook.imageUrl);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      reservationRepository.findByIdWithBookCopy.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should map all fields correctly', async () => {
      reservationRepository.findByIdWithBookCopy.mockResolvedValue(mockReservation);

      const result = await useCase.execute(mockReservation.id);

      expect(result.id).toBe(mockReservation.id);
      expect(result.keycloackClientId).toBe(mockReservation.keycloackClientId);
      expect(result.bookCopyId).toBe(mockBookCopy.id);
      expect(result.bookTitle).toBe(mockBook.title);
      expect(result.bookImage).toBe(mockBook.imageUrl);
      expect(result.reservedAt).toBe(mockReservation.reservedAt);
      expect(result.dueDate).toBe(mockReservation.dueDate);
      expect(result.status).toBe(mockReservation.status);
      expect(result.daysLate).toBe(mockReservation.daysLate);
      expect(result.fineAmount).toBe(mockReservation.fineAmount);
    });

    it('should handle null returnedAt', async () => {
      reservationRepository.findByIdWithBookCopy.mockResolvedValue(mockReservation);

      const result = await useCase.execute(mockReservation.id);

      expect(result.returnedAt).toBeNull();
    });

    it('should handle reservation with returnedAt', async () => {
      const returnedReservation = {
        ...mockReservation,
        returnedAt: new Date(),
        status: ReservationStatus.RETURNED,
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(returnedReservation);

      const result = await useCase.execute(returnedReservation.id);

      expect(result.returnedAt).toBe(returnedReservation.returnedAt);
      expect(result.status).toBe(ReservationStatus.RETURNED);
    });

    it('should handle null bookImage', async () => {
      const reservationNoImage = {
        ...mockReservation,
        bookCopy: {
          ...mockBookCopy,
          book: { ...mockBook, imageUrl: null },
        },
      } as unknown as Reservation;

      reservationRepository.findByIdWithBookCopy.mockResolvedValue(reservationNoImage);

      const result = await useCase.execute(reservationNoImage.id);

      expect(result.bookImage).toBeNull();
    });

    it('should propagate repository errors', async () => {
      reservationRepository.findByIdWithBookCopy.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute('some-id')).rejects.toThrow('Database error');
    });
  });
});
