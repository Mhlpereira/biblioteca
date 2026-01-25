import { Module, forwardRef } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { ReservationController } from "./reservation.controller";
import { ClientModule } from "../client/client.module";
import { BookCopyModule } from "../book-copy/book-copy.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Reservation]), forwardRef(() => ClientModule), BookCopyModule],
    controllers: [ReservationController],
    providers: [ReservationService],
    exports: [ReservationService],
})
export class ReservationModule {}
