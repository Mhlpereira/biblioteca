import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BookModule } from "./book/book.module";
import { ReservationModule } from "./reservation/reservation.module";
import { ClientModule } from "./client/client.module";
import { AuthModule } from "./auth/auth.module";
import { TypeormModule } from "./infra/database/typeorm/typeorm.module";
import { LoggerModule } from "nestjs-pino";

@Module({
    imports: [
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
        TypeormModule,
        BookModule,
        ReservationModule,
        ClientModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
