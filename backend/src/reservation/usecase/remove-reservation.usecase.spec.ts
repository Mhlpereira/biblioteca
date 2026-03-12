import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RemoveReservationUseCase } from './remove-reservation.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { Reservation } from '../entities/reservation.entity';
import { RemoveReservationInput } from '../ports/in/remove-reservation.in';
import { ReservationEventProducer } from '../../infra/database/kafka/producer/reservation-event.producer';

describe('RemoveReservationUseCase', () => {
  let useCase: RemoveReservationUseCase;
  let reservationRepository: jest.Mocked<ReservationOutPort>;

  const mockReservation = {
    id: '01HJQZ5R3N7MTXVGQE5J8K9M0R',
    keycloackClientId: 'user-123',
    reservedAt: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: ReservationStatus.ACTIVE,
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

    const mockEventProducer = { emitReservationEvent: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveReservationUseCase,
        { provide: 'ReservationOutPort', useValue: mockReservationRepository },
        { provide: ReservationEventProducer, useValue: mockEventProducer },
      ],
    }).compile();

    useCase = module.get<RemoveReservationUseCase>(RemoveReservationUseCase);
    reservationRepository = module.get('ReservationOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should remove a reservation successfully', async () => {
      const input: RemoveReservationInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      reservationRepository.findById.mockResolvedValue(mockReservation);
      reservationRepository.remove.mockResolvedValue();

      await useCase.execute(input);

      expect(reservationRepository.findById).toHaveBeenCalledWith(input.id);
      expect(reservationRepository.remove).toHaveBeenCalledWith(mockReservation);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      const input: RemoveReservationInput = { id: 'non-existent-id' };

      reservationRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
      expect(reservationRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException with correct message', async () => {
      const input: RemoveReservationInput = { id: 'non-existent-id' };

      reservationRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow(
        `Reserva com ID ${input.id} não encontrada`,
      );
    });

    it('should propagate repository errors on findById', async () => {
      const input: RemoveReservationInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      reservationRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(input)).rejects.toThrow('Database error');
    });

    it('should propagate repository errors on remove', async () => {
      const input: RemoveReservationInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      reservationRepository.findById.mockResolvedValue(mockReservation);
      reservationRepository.remove.mockRejectedValue(new Error('Delete failed'));

      await expect(useCase.execute(input)).rejects.toThrow('Delete failed');
    });

    it('should return void on success', async () => {
      const input: RemoveReservationInput = { id: '01HJQZ5R3N7MTXVGQE5J8K9M0R' };

      reservationRepository.findById.mockResolvedValue(mockReservation);
      reservationRepository.remove.mockResolvedValue();

      const result = await useCase.execute(input);

      expect(result).toBeUndefined();
    });
  });
});
