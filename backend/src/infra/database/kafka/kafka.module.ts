import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ReservationEventProducer } from "./producer/reservation-event.producer";

@Module({
    imports: [
        ClientsModule.register([
            {
                name: "KAFKA_SERVICE",
                transport: Transport.KAFKA,
                options: {
                    client: {
                        brokers: [process.env.KAFKA_BROKERS ?? "kafka:9092"],
                    },
                    producer: {
                        allowAutoTopicCreation: true,
                    },
                },
            },
        ]),
    ],
    providers: [ReservationEventProducer],
    exports: [ClientsModule, ReservationEventProducer],
})
export class KafkaModule {}
