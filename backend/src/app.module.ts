import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BookModule } from "./book/book.module";
import { ReservationModule } from "./reservation/reservation.module";
import { ClientModule } from "./client/client.module";
import { AuthModule } from "./auth/auth.module";
import { LoggerModule } from "nestjs-pino";
import { CryptoModule } from "./common/crypto/crypto.module";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guard/jwt.guard";
import { BookCopyModule } from "./book-copy/book-copy.module";
import { dataSourceOptions } from "./infra/database/typeorm/data-source";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
        }),
        LoggerModule.forRoot({
            pinoHttp: {
                transport: {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                        singleLine: true,
                    },
                },
            },
        }),
        TypeOrmModule.forRootAsync({
            useFactory: async () => dataSourceOptions,
        }),
        BookModule,
        ReservationModule,
        ClientModule,
        AuthModule,
        CryptoModule,
        BookCopyModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
