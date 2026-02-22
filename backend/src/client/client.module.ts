import { Module, forwardRef } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { CryptoModule } from '../common/crypto/crypto.module';
import { ReservationModule } from '../reservation/reservation.module';
import { KeycloakService } from '../auth/keycloack.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), CryptoModule, forwardRef(() => ReservationModule)],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
