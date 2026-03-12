import { Controller, Get, Logger } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  @Public()
  async getHealth() {
    this.logger.log('[HEALTH-CHECK] Verificação de saúde solicitada');
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: '✅ Connected',
        application: '✅ Running'
      }
    };

    this.logger.log(`[HEALTH-CHECK] Status: ${JSON.stringify(health)}`);
    return health;
  }

  @Get('kafka')
  @Public()
  async getKafkaStatus() {
    this.logger.log('[HEALTH-CHECK] Verificando status do Kafka...');
    
    const kafkaStatus = {
      service: 'kafka',
      status: 'unknown',
      message: 'Verificação de conectividade do Kafka ainda não implementada',
      timestamp: new Date().toISOString()
    };

    this.logger.log(`[HEALTH-CHECK-KAFKA] ${JSON.stringify(kafkaStatus)}`);
    return kafkaStatus;
  }

  @Get('elasticsearch') 
  @Public()
  async getElasticStatus() {
    this.logger.log('[HEALTH-CHECK] Verificando status do ElasticSearch...');
    
    try {
      const elasticStatus = {
        service: 'elasticsearch',
        status: 'unknown',
        message: 'Verificação de conectividade do ElasticSearch ainda não implementada',
        timestamp: new Date().toISOString()
      };

      this.logger.log(`[HEALTH-CHECK-ELASTIC] ${JSON.stringify(elasticStatus)}`);
      return elasticStatus;
    } catch (error) {
      this.logger.error('[HEALTH-CHECK-ELASTIC] Erro ao verificar ElasticSearch:', error);
      return {
        service: 'elasticsearch',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}