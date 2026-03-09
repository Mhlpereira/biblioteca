import { Module } from "@nestjs/common";
import { ReservationConsumer } from "./reservation.consumer";


@Module({
    imports: [],
    providers: [ReservationConsumer],
})
export class KafkaConsumerModule {}