import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { RemoveReservationInput } from '../ports/in/remove-reservation.in';

@Injectable()
export class RemoveReservationUseCase {
  constructor(
    @Inject('ReservationOutPort')
    private readonly repository: ReservationOutPort,
  ) {}

  async execute(input: RemoveReservationInput): Promise<void> {
    const reservation = await this.repository.findById(input.id);

    if (!reservation) {
      throw new NotFoundException(`Reserva com ID ${input.id} não encontrada`);
    }

    await this.repository.remove(reservation);
  }
}