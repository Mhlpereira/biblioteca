import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateFullReservationUseCase } from './create-full-reservation.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { BookCopy } from '../../book-copy/entities/book-copy.entity';
import { Reservation } from '../entities/reservation.entity';
import { CreateFullReservationInput } from '../ports/in/create-full-reservation.in';

describe('CreateFullReservationUseCase', () => {
  let useCase: CreateFullReservationUseCase;
  let reservationRepository: jest.Mocked<ReservationOutPort>;
  let bookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort>;
  let mockDataSource: { transaction: jest.Mock };

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
    status: BookCopyStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as BookCopy;

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

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (manager: { save: jest.Mock; update: jest.Mock }) => Promise<void>) => {
        await cb({
          save: jest.fn(),
          update: jest.fn(),
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateFullReservationUseCase,
          useFactory: () =>
            new CreateFullReservationUseCase(
              mockReservationRepository,
              mockBookCopyRepository,
              mockDataSource as never,
            ),
        },
      ],
    }).compile();

    useCase = module.get<CreateFullReservationUseCase>(CreateFullReservationUseCase);
    reservationRepository = mockReservationRepository;
    bookCopyRepository = mockBookCopyRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a full reservation successfully', async () => {
      const input: CreateFullReservationInput = {
        keycloackClientId: 'user-123',
        bookCopyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        dueDate: '2026-04-01',
        status: ReservationStatus.ACTIVE,
      };

      const createdReservation = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        keycloackClientId: 'user-123',
        bookCopy: mockBookCopy,
        reservedAt: new Date(),
        dueDate: new Date('2026-04-01'),
        status: ReservationStatus.ACTIVE,
        daysLate: 0,
        fineAmount: 0,
      } as unknown as Reservation;

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockBookCopy);
      reservationRepository.create.mockResolvedValue(createdReservation);

      const result = await useCase.execute(input);

      expect(bookCopyRepository.findAvailableByBookId).toHaveBeenCalledWith(input.bookCopyId);
      expect(reservationRepository.create).toHaveBeenCalled();
      expect(result.keycloackClientId).toBe('user-123');
      expect(result.bookCopyId).toBe(mockBookCopy.id);
    });

    it('should throw NotFoundException when book copy not found', async () => {
      const input: CreateFullReservationInput = {
        keycloackClientId: 'user-123',
        bookCopyId: 'non-existent',
        dueDate: '2026-04-01',
      };

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
      expect(reservationRepository.create).not.toHaveBeenCalled();
    });

    it('should set RETURNED status and AVAILABLE copy status when status is RETURNED', async () => {
      const input: CreateFullReservationInput = {
        keycloackClientId: 'user-123',
        bookCopyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        dueDate: '2026-04-01',
        status: ReservationStatus.RETURNED,
        returnedAt: '2026-03-28',
      };

      const createdReservation = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        keycloackClientId: 'user-123',
        bookCopy: mockBookCopy,
        reservedAt: new Date(),
        dueDate: new Date('2026-04-01'),
        returnedAt: new Date('2026-03-28'),
        status: ReservationStatus.RETURNED,
        daysLate: 0,
        fineAmount: 0,
      } as unknown as Reservation;

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockBookCopy);
      reservationRepository.create.mockResolvedValue(createdReservation);

      const saveMock = jest.fn();
      const updateMock = jest.fn();
      mockDataSource.transaction.mockImplementation(async (cb: (manager: { save: jest.Mock; update: jest.Mock }) => Promise<void>) => {
        await cb({ save: saveMock, update: updateMock });
      });

      await useCase.execute(input);

      expect(updateMock).toHaveBeenCalledWith(BookCopy, mockBookCopy.id, { status: BookCopyStatus.AVAILABLE });
    });

    it('should set RESERVED copy status when status is ACTIVE', async () => {
      const input: CreateFullReservationInput = {
        keycloackClientId: 'user-123',
        bookCopyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        dueDate: '2026-04-01',
        status: ReservationStatus.ACTIVE,
      };

      const createdReservation = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        keycloackClientId: 'user-123',
        bookCopy: mockBookCopy,
        reservedAt: new Date(),
        dueDate: new Date('2026-04-01'),
        status: ReservationStatus.ACTIVE,
        daysLate: 0,
        fineAmount: 0,
      } as unknown as Reservation;

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockBookCopy);
      reservationRepository.create.mockResolvedValue(createdReservation);

      const saveMock = jest.fn();
      const updateMock = jest.fn();
      mockDataSource.transaction.mockImplementation(async (cb: (manager: { save: jest.Mock; update: jest.Mock }) => Promise<void>) => {
        await cb({ save: saveMock, update: updateMock });
      });

      await useCase.execute(input);

      expect(updateMock).toHaveBeenCalledWith(BookCopy, mockBookCopy.id, { status: BookCopyStatus.RESERVED });
    });

    it('should use provided reservedAt date', async () => {
      const input: CreateFullReservationInput = {
        keycloackClientId: 'user-123',
        bookCopyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        dueDate: '2026-04-01',
        reservedAt: '2026-03-01',
      };

      const createdReservation = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        keycloackClientId: 'user-123',
        bookCopy: mockBookCopy,
        reservedAt: new Date('2026-03-01'),
        dueDate: new Date('2026-04-01'),
        status: ReservationStatus.ACTIVE,
        daysLate: 0,
        fineAmount: 0,
      } as unknown as Reservation;

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockBookCopy);
      reservationRepository.create.mockResolvedValue(createdReservation);

      const result = await useCase.execute(input);

      expect(result.reservedAt).toEqual(new Date('2026-03-01'));
    });

    it('should use default values for optional fields', async () => {
      const input: CreateFullReservationInput = {
        keycloackClientId: 'user-123',
        bookCopyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        dueDate: '2026-04-01',
      };

      const createdReservation = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        keycloackClientId: 'user-123',
        bookCopy: mockBookCopy,
        reservedAt: new Date(),
        dueDate: new Date('2026-04-01'),
        status: ReservationStatus.ACTIVE,
        daysLate: 0,
        fineAmount: 0,
      } as unknown as Reservation;

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockBookCopy);
      reservationRepository.create.mockResolvedValue(createdReservation);

      const result = await useCase.execute(input);

      expect(result.status).toBe(ReservationStatus.ACTIVE);
      expect(result.daysLate).toBe(0);
      expect(result.fineAmount).toBe(0);
    });

    it('should propagate repository errors', async () => {
      const input: CreateFullReservationInput = {
        keycloackClientId: 'user-123',
        bookCopyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        dueDate: '2026-04-01',
      };

      bookCopyRepository.findAvailableByBookId.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(input)).rejects.toThrow('Database error');
    });
  });
});
