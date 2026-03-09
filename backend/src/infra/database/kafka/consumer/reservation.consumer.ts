import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class ReservationConsumer {
    constructor() {}

    @MessagePattern("reservation.created")
    async handleReservationCreated(@Payload() data: any) {
        console.log("Mensagem recebida:", data);
    }
}