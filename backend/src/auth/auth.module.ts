import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './guard/jwt.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard, AuthService],
})
export class AuthModule {}