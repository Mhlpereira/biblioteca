import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ReservationService } from "../../../../reservation/reservation.service";

@Controller()
export class ReservationConsumer {
    constructor(private readonly reservationService: ReservationService) {}

    @MessagePattern("reservation.created")
    async handleReservationCreated(@Payload() data: any) {
        console.log("Mensagem recebida:", data);
    }
}