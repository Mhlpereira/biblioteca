import { Test, TestingModule } from '@nestjs/testing';
import { ReservationEventProducer } from './reservation-event.producer';
import { Reservation } from '../../../../reservation/entities/reservation.entity';
import { ReservationStatus } from '../../../../reservation/enum/reservation-status.enum';

describe('ReservationEventProducer', () => {
  let producer: ReservationEventProducer;
  let kafkaClient: {
    connect: jest.Mock;
    emit: jest.Mock;
  };

  const mockBook = {
    id: 'book-id-1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    imageUrl: 'http://example.com/image.png',
    active: true,
    copies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBookCopy = {
    id: 'copy-id-1',
    book: mockBook,
    status: 'RESERVED',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReservation = {
    id: 'reservation-id-1',
    keycloackClientId: 'user-uuid-123',
    bookCopy: mockBookCopy,
    reservedAt: new Date('2025-01-01T00:00:00Z'),
    dueDate: new Date('2025-01-15T00:00:00Z'),
    returnedAt: null as unknown as Date,
    status: ReservationStatus.ACTIVE,
    fineAmount: null as unknown as number,
    daysLate: null as unknown as number,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Reservation;

  beforeEach(async () => {
    kafkaClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationEventProducer,
        {
          provide: 'KAFKA_SERVICE',
          useValue: kafkaClient,
        },
      ],
    }).compile();

    producer = module.get<ReservationEventProducer>(ReservationEventProducer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(producer).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call kafkaClient.connect()', async () => {
      await producer.onModuleInit();

      expect(kafkaClient.connect).toHaveBeenCalled();
    });
  });

  describe('emitReservationEvent', () => {
    it('should build and emit a reservation event successfully', async () => {
      await producer.emitReservationEvent(mockReservation, 'created');

      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'reservations',
        expect.objectContaining({
          key: mockReservation.id,
          value: expect.objectContaining({
            id: mockReservation.id,
            action: 'created',
            keycloackClientId: mockReservation.keycloackClientId,
            bookCopyId: mockBookCopy.id,
            bookId: mockBook.id,
            bookTitle: mockBook.title,
            bookAuthor: mockBook.author,
            status: ReservationStatus.ACTIVE,
            isReturned: false,
            daysLate: 0,
            fineAmount: 0,
          }),
        }),
      );
    });

    it('should set isReturned to true when returnedAt is set', async () => {
      const returnedReservation = {
        ...mockReservation,
        returnedAt: new Date('2025-01-10T00:00:00Z'),
        status: ReservationStatus.RETURNED,
      } as unknown as Reservation;

      await producer.emitReservationEvent(returnedReservation, 'returned');

      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'reservations',
        expect.objectContaining({
          value: expect.objectContaining({
            isReturned: true,
            returnedAt: '2025-01-10T00:00:00.000Z',
          }),
        }),
      );
    });

    it('should include fineAmount and daysLate when set', async () => {
      const overdueReservation = {
        ...mockReservation,
        fineAmount: 5.5,
        daysLate: 3,
      } as unknown as Reservation;

      await producer.emitReservationEvent(overdueReservation, 'updated');

      expect(kafkaClient.emit).toHaveBeenCalledWith(
        'reservations',
        expect.objectContaining({
          value: expect.objectContaining({
            fineAmount: 5.5,
            daysLate: 3,
          }),
        }),
      );
    });

    it('should include a sha256 idempotencyKey', async () => {
      await producer.emitReservationEvent(mockReservation, 'created');

      const emitCall = kafkaClient.emit.mock.calls[0];
      const event = emitCall[1].value;

      expect(event.idempotencyKey).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should not throw when kafkaClient.emit throws - logs error instead', async () => {
      kafkaClient.emit.mockImplementation(() => {
        throw new Error('Kafka connection lost');
      });

      const errorSpy = jest
        .spyOn((producer as any).logger, 'error')
        .mockImplementation(() => {});

      await expect(
        producer.emitReservationEvent(mockReservation, 'created'),
      ).resolves.not.toThrow();

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle reservation with null imageUrl gracefully', async () => {
      const reservationWithNullImage = {
        ...mockReservation,
        bookCopy: {
          ...mockBookCopy,
          book: { ...mockBook, imageUrl: null as unknown as string },
        },
      } as unknown as Reservation;

      await producer.emitReservationEvent(reservationWithNullImage, 'created');

      const event = kafkaClient.emit.mock.calls[0][1].value;
      expect(event.bookImageUrl).toBeNull();
    });
  });
});
