import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CryptoModule } from '../common/crypto/crypto.module';
import { JwtModule } from '@nestjs/jwt';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [CryptoModule, JwtModule, ClientModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
