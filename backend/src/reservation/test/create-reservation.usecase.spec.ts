import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { CreateReservationUseCase } from '../usecase/create-reservation.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { Reservation } from '../entities/reservation.entity';
import { BookCopy } from '../../book-copy/entities/book-copy.entity';

describe('CreateReservationUseCase', () => {
  let useCase: CreateReservationUseCase;

  const mockReservationRepository: jest.Mocked<ReservationOutPort> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdWithBookCopy: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockBookCopyRepository = {
    findAvailableByBookId: jest.fn(),
    updateStatus: jest.fn(),
  } as any;

  const mockManagerSave = jest.fn();
  const mockManagerUpdate = jest.fn();

  const mockDataSource = {
    transaction: jest.fn(async (cb: any) => {
      await cb({
        save: mockManagerSave,
        update: mockManagerUpdate,
      });
    }),
  };

  const mockKafkaClient = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReservationUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
        { provide: 'BookCopyRepositoryOutPort', useValue: mockBookCopyRepository },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: 'KAFKA_SERVICE', useValue: mockKafkaClient },
      ],
    }).compile();

    useCase = module.get(CreateReservationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const bookCopy = {
    id: 'copy-1',
    book: { id: 'book-1', title: 'Test Book' },
    status: BookCopyStatus.AVAILABLE,
  } as unknown as BookCopy;

  const createdReservation = {
    id: 'res-1',
    keycloackClientId: 'client-1',
    bookCopy,
    reservedAt: new Date('2026-03-07'),
    dueDate: new Date('2026-03-14'),
    status: ReservationStatus.ACTIVE,
    daysLate: undefined,
    fineAmount: undefined,
  } as unknown as Reservation;

  it('should create a reservation successfully', async () => {
    mockBookCopyRepository.findAvailableByBookId.mockResolvedValue(bookCopy);
    mockReservationRepository.create.mockResolvedValue(createdReservation);

    const result = await useCase.execute({
      keycloackClientId: 'client-1',
      bookId: 'book-1',
    });

    expect(mockBookCopyRepository.findAvailableByBookId).toHaveBeenCalledWith('book-1');
    expect(mockReservationRepository.create).toHaveBeenCalled();
    expect(mockDataSource.transaction).toHaveBeenCalled();
    expect(mockManagerSave).toHaveBeenCalledWith(createdReservation);
    expect(mockManagerUpdate).toHaveBeenCalledWith(BookCopy, 'copy-1', {
      status: BookCopyStatus.RESERVED,
    });
    expect(mockKafkaClient.emit).toHaveBeenCalledWith('reservation.created', expect.objectContaining({
      id: 'res-1',
      clientId: 'client-1',
    }));
    expect(result).toEqual(expect.objectContaining({
      id: 'res-1',
      clientId: 'client-1',
      bookCopyId: 'copy-1',
      status: ReservationStatus.ACTIVE,
    }));
  });

  it('should use provided dueDate', async () => {
    mockBookCopyRepository.findAvailableByBookId.mockResolvedValue(bookCopy);
    mockReservationRepository.create.mockResolvedValue(createdReservation);

    await useCase.execute({
      keycloackClientId: 'client-1',
      bookId: 'book-1',
      dueDate: '2026-04-01',
    });

    const createCall = mockReservationRepository.create.mock.calls[0][0];
    expect(createCall.dueDate).toEqual(new Date('2026-04-01'));
  });

  it('should throw NotFoundException when no copy available', async () => {
    mockBookCopyRepository.findAvailableByBookId.mockResolvedValue(null);

    await expect(
      useCase.execute({ keycloackClientId: 'client-1', bookId: 'book-1' }),
    ).rejects.toThrow(NotFoundException);
  });
});
