import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BookModule } from "./book/book.module";
import { ReservationModule } from "./reservation/reservation.module";
import { ClientModule } from "./client/client.module";
import { AuthModule } from "./auth/auth.module";
import { LoggerModule } from "nestjs-pino";
import { CryptoModule } from "./common/crypto/crypto.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guard/jwt.guard";
import { BookCopyModule } from "./book-copy/book-copy.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

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
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const isTest = config.get<string>("NODE_ENV") === "test";

                if (isTest) {
                    return {
                        type: "better-sqlite3",
                        database: ":memory:",
                        entities: ["src/**/*.entity.ts"],
                        synchronize: true,
                        dropSchema: true, 
                        logging: false,
                    };
                }

                return {
                    type: "mysql",
                    host: config.get<string>("DATABASE_HOST"),
                    port: config.get<number>("DATABASE_PORT"),
                    username: config.get<string>("DATABASE_USER"),
                    password: config.get<string>("DATABASE_PASSWORD"),
                    database: config.get<string>("DATABASE_NAME"),
                    entities: ["dist/**/*.entity.js"],
                    synchronize: false,
                    logging: config.get("NODE_ENV") !== "production",
                    namingStrategy: new SnakeNamingStrategy(),
                };
            },
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
