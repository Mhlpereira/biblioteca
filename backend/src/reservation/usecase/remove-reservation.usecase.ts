import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { RemoveReservationInput } from '../ports/in/remove-reservation.in';
import { ReservationEventProducer } from '../../infra/database/kafka/producer/reservation-event.producer';

@Injectable()
export class RemoveReservationUseCase {
  constructor(
    @Inject('ReservationOutPort')
    private readonly repository: ReservationOutPort,

    private readonly reservationEventProducer: ReservationEventProducer,
  ) {}

  async execute(input: RemoveReservationInput): Promise<void> {
    const reservation = await this.repository.findById(input.id);

    if (!reservation) {
      throw new NotFoundException(`Reserva com ID ${input.id} não encontrada`);
    }

    await this.repository.remove(reservation);
    await this.reservationEventProducer.emitReservationEvent(reservation, 'deleted');
  }
}