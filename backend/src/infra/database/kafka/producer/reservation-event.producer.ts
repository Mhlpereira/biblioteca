import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { createHash } from 'crypto';
import { Reservation } from '../../../../reservation/entities/reservation.entity';
import { ReservationAction, ReservationEvent } from '../interface/reservation-event.interface';


@Injectable()
export class ReservationEventProducer implements OnModuleInit {
  private readonly logger = new Logger(ReservationEventProducer.name);
  private static readonly TOPIC = 'reservations';

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async emitReservationEvent(
    reservation: Reservation,
    action: ReservationAction,
  ): Promise<void> {
    const reservedAtIso = reservation.reservedAt?.toISOString();
    const dueDateIso = reservation.dueDate?.toISOString();
    const returnedAtIso = reservation.returnedAt?.toISOString() ?? null;

    const idempotencyKey = createHash('sha256')
      .update(
        JSON.stringify({
          id: reservation.id,
          action,
          status: reservation.status,
          reservedAt: reservedAtIso,
          dueDate: dueDateIso,
          returnedAt: returnedAtIso,
          fineAmount: reservation.fineAmount ?? 0,
          daysLate: reservation.daysLate ?? 0,
        }),
      )
      .digest('hex');

    const event: ReservationEvent = {
      id: reservation.id,
      idempotencyKey,
      action,
      keycloackClientId: reservation.keycloackClientId,
      bookCopyId: reservation.bookCopy?.id,
      bookId: reservation.bookCopy?.book?.id,
      bookTitle: reservation.bookCopy?.book?.title,
      bookAuthor: reservation.bookCopy?.book?.author,
      bookImageUrl: reservation.bookCopy?.book?.imageUrl ?? null,
      bookImage: reservation.bookCopy?.book?.imageUrl ?? null,
      reservedAt: reservedAtIso,
      dueDate: dueDateIso,
      returnedAt: returnedAtIso,
      isReturned: reservation.returnedAt !== null,
      status: reservation.status,
      daysLate: reservation.daysLate ?? 0,
      fineAmount: reservation.fineAmount ?? 0,
      ts: new Date().toISOString(),
    };

    try {
      this.logger.log(`[KAFKA-PRODUCER] Tentando enviar evento [${action}] para Kafka...`);
      this.logger.log(`[KAFKA-PRODUCER] Dados do evento:`, JSON.stringify(event, null, 2));
      
      this.kafkaClient.emit(ReservationEventProducer.TOPIC, {
        key: reservation.id,
        value: event,
      });
      
      this.logger.log(`[KAFKA-PRODUCER] ✅ Evento [${action}] emitido com sucesso para reserva ${reservation.id}`);
      this.logger.log(`[KAFKA-PRODUCER] Tópico: ${ReservationEventProducer.TOPIC}`);
    } catch (error) {
      this.logger.error(`[KAFKA-PRODUCER] ❌ Falha ao emitir evento [${action}] para reserva ${reservation.id}:`, error);
      this.logger.error(`[KAFKA-PRODUCER] Stack trace:`, error.stack);
    }
  }
}
