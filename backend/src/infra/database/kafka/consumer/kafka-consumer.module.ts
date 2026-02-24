import { Module } from "@nestjs/common";
import { ReservationModule } from "../../../../reservation/reservation.module";
import { ReservationConsumer } from "./reservation.consumer";


@Module({
    imports: [ReservationModule],
    providers: [ReservationConsumer],
})
export class KafkaConsumerModule {}