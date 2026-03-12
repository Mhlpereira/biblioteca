import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateReservationUseCase } from './create-reservation.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { BookCopy } from '../../book-copy/entities/book-copy.entity';
import { Reservation } from '../entities/reservation.entity';
import { CreateReservationInput } from '../ports/in/create-reservation.in';

describe('CreateReservationUseCase', () => {
  let useCase: CreateReservationUseCase;
  let reservationRepository: jest.Mocked<ReservationOutPort>;
  let bookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort>;
  let mockDataSource: { transaction: jest.Mock };
  let mockEventProducer: { emitReservationEvent: jest.Mock };

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

  const mockReservation = {
    id: expect.any(String),
    keycloackClientId: 'user-123',
    bookCopy: mockBookCopy,
    reservedAt: expect.any(Date),
    dueDate: expect.any(Date),
    status: ReservationStatus.ACTIVE,
    daysLate: undefined,
    fineAmount: undefined,
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

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (manager: { save: jest.Mock; update: jest.Mock }) => Promise<void>) => {
        await cb({
          save: jest.fn(),
          update: jest.fn(),
        });
      }),
    };

    mockEventProducer = {
      emitReservationEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReservationUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
        { provide: 'BookCopyRepositoryOutPort', useValue: mockBookCopyRepository },
        { provide: 'DATASOURCE', useValue: mockDataSource },
      ],
    })
      .overrideProvider(CreateReservationUseCase)
      .useFactory({
        factory: () => {
          const instance = new CreateReservationUseCase(
            mockReservationRepository,
            mockBookCopyRepository,
            mockDataSource as never,
            mockEventProducer as never,
          );
          return instance;
        },
      })
      .compile();

    useCase = module.get<CreateReservationUseCase>(CreateReservationUseCase);
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
    it('should create a reservation successfully', async () => {
      const input: CreateReservationInput = {
        keycloackClientId: 'user-123',
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const createdReservation = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        keycloackClientId: 'user-123',
        bookCopy: mockBookCopy,
        reservedAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: ReservationStatus.ACTIVE,
        daysLate: 0,
        fineAmount: 0,
      } as unknown as Reservation;

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockBookCopy);
      reservationRepository.create.mockResolvedValue(createdReservation);

      const result = await useCase.execute(input);

      expect(bookCopyRepository.findAvailableByBookId).toHaveBeenCalledWith(input.bookId);
      expect(reservationRepository.create).toHaveBeenCalled();
      expect(result.keycloackClientId).toBe('user-123');
      expect(result.bookCopyId).toBe(mockBookCopy.id);
      expect(result.status).toBe(ReservationStatus.ACTIVE);
    });

    it('should throw NotFoundException when no available copy', async () => {
      const input: CreateReservationInput = {
        keycloackClientId: 'user-123',
        bookId: 'non-existent-book',
      };

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
      expect(reservationRepository.create).not.toHaveBeenCalled();
    });

    it('should use provided dueDate when given', async () => {
      const input: CreateReservationInput = {
        keycloackClientId: 'user-123',
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
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

      expect(result.dueDate).toEqual(new Date('2026-04-01'));
    });

    it('should emit kafka event after creation', async () => {
      const input: CreateReservationInput = {
        keycloackClientId: 'user-123',
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const createdReservation = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        keycloackClientId: 'user-123',
        bookCopy: mockBookCopy,
        reservedAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: ReservationStatus.ACTIVE,
        daysLate: 0,
        fineAmount: 0,
      } as unknown as Reservation;

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockBookCopy);
      reservationRepository.create.mockResolvedValue(createdReservation);

      await useCase.execute(input);

      expect(mockEventProducer.emitReservationEvent).toHaveBeenCalledWith(
        createdReservation,
        'created',
      );
    });

    it('should execute transaction with save and update', async () => {
      const input: CreateReservationInput = {
        keycloackClientId: 'user-123',
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      const createdReservation = {
        id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        keycloackClientId: 'user-123',
        bookCopy: mockBookCopy,
        reservedAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: ReservationStatus.ACTIVE,
        daysLate: 0,
        fineAmount: 0,
      } as unknown as Reservation;

      bookCopyRepository.findAvailableByBookId.mockResolvedValue(mockBookCopy);
      reservationRepository.create.mockResolvedValue(createdReservation);

      await useCase.execute(input);

      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const input: CreateReservationInput = {
        keycloackClientId: 'user-123',
        bookId: '01HJQZ5R3N7MTXVGQE5J8K9M0P',
      };

      bookCopyRepository.findAvailableByBookId.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(input)).rejects.toThrow('Database error');
    });
  });
});
