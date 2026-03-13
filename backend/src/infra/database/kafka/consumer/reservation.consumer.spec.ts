import { Test, TestingModule } from '@nestjs/testing';
import { ReservationConsumer } from './reservation.consumer';

describe('ReservationConsumer', () => {
  let consumer: ReservationConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationConsumer],
    }).compile();

    consumer = module.get<ReservationConsumer>(ReservationConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('handleReservationEvent', () => {
    it('should log the received event with action and id', async () => {
      const logSpy = jest
        .spyOn((consumer as any).logger, 'log')
        .mockImplementation(() => {});

      const data = { action: 'CREATED', id: 'reservation-123' };

      await consumer.handleReservationEvent(data);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('CREATED'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('reservation-123'),
      );
    });

    it('should handle undefined data gracefully', async () => {
      const logSpy = jest
        .spyOn((consumer as any).logger, 'log')
        .mockImplementation(() => {});

      await expect(consumer.handleReservationEvent(undefined)).resolves.not.toThrow();

      expect(logSpy).toHaveBeenCalled();
    });

    it('should handle data with no action or id', async () => {
      const logSpy = jest
        .spyOn((consumer as any).logger, 'log')
        .mockImplementation(() => {});

      await consumer.handleReservationEvent({});

      expect(logSpy).toHaveBeenCalled();
    });
  });
});
