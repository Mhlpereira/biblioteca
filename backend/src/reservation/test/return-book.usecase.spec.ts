import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReturnBookUseCase } from '../usecase/return-book.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { Reservation } from '../entities/reservation.entity';

describe('ReturnBookUseCase', () => {
  let useCase: ReturnBookUseCase;

  const mockReservationRepository: jest.Mocked<ReservationOutPort> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdWithBookCopy: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockBookCopyRepository: jest.Mocked<Partial<BookCopyRepositoryOutPort>> = {
    findAvailableByBookId: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnBookUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
        { provide: 'BookCopyRepositoryOutPort', useValue: mockBookCopyRepository },
      ],
    }).compile();

    useCase = module.get(ReturnBookUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const makeReservation = (overrides?: Partial<Reservation>): Reservation => ({
    id: 'res-1',
    client: { id: 'client-1' } as any,
    bookCopy: { id: 'copy-1' } as any,
    reservedAt: new Date('2026-03-01'),
    dueDate: new Date('2026-03-08'),
    status: ReservationStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Reservation);

  it('should return a book successfully (on time)', async () => {
    const reservation = makeReservation({
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // future
    });
    const savedReservation = {
      ...reservation,
      status: ReservationStatus.RETURNED,
      returnedAt: expect.any(Date),
    };

    mockReservationRepository.findByIdWithBookCopy.mockResolvedValue(reservation);
    mockReservationRepository.save.mockResolvedValue(savedReservation as any);

    const result = await useCase.execute({ id: 'res-1' });

    expect(mockReservationRepository.findByIdWithBookCopy).toHaveBeenCalledWith('res-1');
    expect(mockBookCopyRepository.updateStatus).toHaveBeenCalledWith('copy-1', BookCopyStatus.AVAILABLE);
    expect(mockReservationRepository.save).toHaveBeenCalled();
    expect(result.status).toBe(ReservationStatus.RETURNED);
  });

  it('should calculate fine when book is overdue', async () => {
    const pastDueDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const reservation = makeReservation({ dueDate: pastDueDate });

    mockReservationRepository.findByIdWithBookCopy.mockResolvedValue(reservation);
    mockReservationRepository.save.mockImplementation(async (r) => r);

    const result = await useCase.execute({ id: 'res-1' });

    const savedArg = mockReservationRepository.save.mock.calls[0][0];
    expect(savedArg.daysLate).toBeGreaterThan(0);
    expect(savedArg.fineAmount).toBeGreaterThan(0);
    expect(savedArg.status).toBe(ReservationStatus.RETURNED);
  });

  it('should throw NotFoundException when reservation not found', async () => {
    mockReservationRepository.findByIdWithBookCopy.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'non-existent' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when already returned', async () => {
    const reservation = makeReservation({ status: ReservationStatus.RETURNED });
    mockReservationRepository.findByIdWithBookCopy.mockResolvedValue(reservation);

    await expect(
      useCase.execute({ id: 'res-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should not update book copy status when bookCopy is null', async () => {
    const reservation = makeReservation({
      bookCopy: undefined as any,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    mockReservationRepository.findByIdWithBookCopy.mockResolvedValue(reservation);
    mockReservationRepository.save.mockImplementation(async (r) => r);

    await useCase.execute({ id: 'res-1' });

    expect(mockBookCopyRepository.updateStatus).not.toHaveBeenCalled();
  });
});
