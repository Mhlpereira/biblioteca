import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status with ok and services', async () => {
      const result = await controller.getHealth();

      expect(result).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        services: {
          database: expect.any(String),
          application: expect.any(String),
        },
      });
    });

    it('should return a valid ISO timestamp', async () => {
      const result = await controller.getHealth();

      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });

  describe('getKafkaStatus', () => {
    it('should return kafka status object', async () => {
      const result = await controller.getKafkaStatus();

      expect(result).toMatchObject({
        service: 'kafka',
        status: expect.any(String),
        message: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('should return a valid ISO timestamp', async () => {
      const result = await controller.getKafkaStatus();

      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });

  describe('getElasticStatus', () => {
    it('should return elasticsearch status object', async () => {
      const result = await controller.getElasticStatus();

      expect(result).toMatchObject({
        service: 'elasticsearch',
        status: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('should return a valid ISO timestamp', async () => {
      const result = await controller.getElasticStatus();

      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });
});
