import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class ReservationConsumer {
    private readonly logger = new Logger(ReservationConsumer.name);

    @MessagePattern("reservations")
    async handleReservationEvent(@Payload() data: any) {
        this.logger.log(
            `Evento de reserva recebido: [${data?.action}] reserva ${data?.id}`,
        );
    }
}