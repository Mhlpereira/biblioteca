import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RemoveReservationUseCase } from '../usecase/remove-reservation.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { Book } from '../../book/entities/book.entity';

describe('RemoveReservationUseCase', () => {
  let useCase: RemoveReservationUseCase;

  const mockReservationRepository: jest.Mocked<ReservationOutPort> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdWithBookCopy: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveReservationUseCase,
        { provide: 'IReservationRepository', useValue: mockReservationRepository },
      ],
    }).compile();

    useCase = module.get(RemoveReservationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const reservation = {
      id: 'res-1',
      keycloackClientId: 'client-1',
      bookCopy: { id: 'copy-1' } as Book,
      reservedAt: new Date('2026-03-01'),
      dueDate: new Date('2026-03-08'),
      status: ReservationStatus.ACTIVE,
  } as unknown as Reservation;

  it('should remove a reservation successfully', async () => {
    mockReservationRepository.findById.mockResolvedValue(reservation);
    mockReservationRepository.remove.mockResolvedValue(undefined);

    await useCase.execute({ id: 'res-1' });

    expect(mockReservationRepository.findById).toHaveBeenCalledWith('res-1');
    expect(mockReservationRepository.remove).toHaveBeenCalledWith(reservation);
  });

  it('should throw NotFoundException when reservation not found', async () => {
    mockReservationRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'non-existent' }),
    ).rejects.toThrow(NotFoundException);

    expect(mockReservationRepository.remove).not.toHaveBeenCalled();
  });
});
