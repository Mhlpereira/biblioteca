import { Module } from "@nestjs/common";
import { ReservationController } from "./reservation.controller";
import { BookCopyModule } from "../book-copy/book-copy.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";
import { AuthModule } from "../auth/auth.module";
import { KafkaModule } from "../infra/database/kafka/kafka.module";
import { ReservationRepository } from "./repository/reservation.repository";
import { CreateFullReservationUseCase } from "./usecase/create-full-reservation.usecase";
import { CreateReservationUseCase } from "./usecase/create-reservation.usecase";
import { FindAllReservationsUseCase } from "./usecase/find-all-reservations.usecase";
import { FindByUserIdReservationUseCase } from "./usecase/find-by-user-id-reservation.usecase";
import { RemoveReservationUseCase } from "./usecase/remove-reservation.usecase";
import { UpdateReservationUseCase } from "./usecase/update-reservation.usecase";
import { FindByIdReservationUseCase } from "./usecase/find-by-id-reservation.usecase";
import { ReturnBookUseCase } from "./usecase/return-book.usecase";

@Module({
    imports: [TypeOrmModule.forFeature([Reservation]), BookCopyModule, AuthModule, KafkaModule],
    controllers: [ReservationController],
    providers: [
        {
            provide: 'ReservationOutPort',
            useClass: ReservationRepository,
        },
        CreateFullReservationUseCase,
        CreateReservationUseCase,
        FindAllReservationsUseCase,
        FindByUserIdReservationUseCase,
        RemoveReservationUseCase,
        UpdateReservationUseCase,
        FindByIdReservationUseCase,
        ReturnBookUseCase,
    ],
    exports: ['ReservationOutPort'],
})
export class ReservationModule {}
