import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateReservationUseCase } from '../usecase/update-reservation.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { Reservation } from '../entities/reservation.entity';

describe('UpdateReservationUseCase', () => {
  let useCase: UpdateReservationUseCase;

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
        UpdateReservationUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
        { provide: 'BookCopyRepositoryOutPort', useValue: mockBookCopyRepository },
      ],
    }).compile();

    useCase = module.get(UpdateReservationUseCase);
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

  it('should update reservation status', async () => {
    const reservation = makeReservation();
    mockReservationRepository.findByIdWithBookCopy.mockResolvedValue(reservation);
    mockReservationRepository.save.mockImplementation(async (r) => r);

    const result = await useCase.execute({
      id: 'res-1',
      status: ReservationStatus.RETURNED,
    });

    expect(mockReservationRepository.findByIdWithBookCopy).toHaveBeenCalledWith('res-1');
    expect(mockBookCopyRepository.updateStatus).toHaveBeenCalledWith('copy-1', BookCopyStatus.AVAILABLE);
    expect(result.status).toBe(ReservationStatus.RETURNED);
  });

  it('should update fine and daysLate fields', async () => {
    const reservation = makeReservation();
    mockReservationRepository.findByIdWithBookCopy.mockResolvedValue(reservation);
    mockReservationRepository.save.mockImplementation(async (r) => r);

    const result = await useCase.execute({
      id: 'res-1',
      daysLate: 5,
      fineAmount: 15.0,
    });

    expect(result.daysLate).toBe(5);
    expect(result.fineAmount).toBe(15.0);
  });

  it('should throw NotFoundException when reservation not found', async () => {
    mockReservationRepository.findByIdWithBookCopy.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'non-existent' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should not update book copy status when status is not RETURNED', async () => {
    const reservation = makeReservation();
    mockReservationRepository.findByIdWithBookCopy.mockResolvedValue(reservation);
    mockReservationRepository.save.mockImplementation(async (r) => r);

    await useCase.execute({
      id: 'res-1',
      fineAmount: 5.0,
    });

    expect(mockBookCopyRepository.updateStatus).not.toHaveBeenCalled();
  });
});
