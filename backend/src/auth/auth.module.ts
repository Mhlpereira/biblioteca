import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './guard/jwt.guard';

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [JwtAuthGuard],
})
export class AuthModule {}