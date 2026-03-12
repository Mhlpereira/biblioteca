import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ulid } from 'ulid';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { BookCopyRepositoryOutPort } from '../../book-copy/ports/book-copy-out.port';
import { CreateReservationInput } from '../ports/in/create-reservation.in';
import { ReservationDetailOutput } from '../ports/out/reservation-detail-output';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { BookCopy } from '../../book-copy/entities/book-copy.entity';
import { BookCopyStatus } from '../../book-copy/enum/book-status.enum';
import { ReservationEventProducer } from '../../infra/database/kafka/producer/reservation-event.producer';


@Injectable()
export class CreateReservationUseCase {
  private readonly logger = new Logger(CreateReservationUseCase.name);

  constructor(
    @Inject('ReservationOutPort')
    private readonly reservationRepository: ReservationOutPort,

    @Inject('BookCopyRepositoryOutPort')
    private readonly bookCopyRepository: BookCopyRepositoryOutPort,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly reservationEventProducer: ReservationEventProducer,
  ) {}

  async execute(input: CreateReservationInput): Promise<ReservationDetailOutput> {
    this.logger.log(`[CREATE-RESERVATION] Iniciando criação de reserva para usuário: ${input.keycloackClientId}`);
    this.logger.log(`[CREATE-RESERVATION] Dados de entrada:`, JSON.stringify(input));

    const bookCopy = await this.bookCopyRepository.findAvailableByBookId(input.bookId);

    if (!bookCopy) {
      this.logger.warn(`[CREATE-RESERVATION] Nenhuma cópia disponível para o livro: ${input.bookId}`);
      throw new NotFoundException('Nenhuma cópia disponível para este livro');
    }

    this.logger.log(`[CREATE-RESERVATION] Cópia encontrada: ${bookCopy.id}`);

    const reservation = await this.reservationRepository.create({
      id: ulid(),
      keycloackClientId: input.keycloackClientId,
      bookCopy,
      reservedAt: new Date(),
      dueDate: input.dueDate
        ? new Date(input.dueDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: ReservationStatus.ACTIVE,
    });

    await this.dataSource.transaction(async manager => {
      await manager.save(reservation);
      await manager.update(BookCopy, bookCopy.id, {
        status: BookCopyStatus.RESERVED,
      });
    });

    this.logger.log(`[CREATE-RESERVATION] Reserva criada com sucesso. ID: ${reservation.id}`);
    this.logger.log(`[CREATE-RESERVATION] Enviando evento para o Kafka...`);
    await this.reservationEventProducer.emitReservationEvent(reservation, 'created');
    this.logger.log(`[CREATE-RESERVATION] ✅ Processo de criação concluído com sucesso`);

    return {
      id: reservation.id,
      keycloackClientId: input.keycloackClientId,
      bookCopyId: bookCopy.id,
      reservedAt: reservation.reservedAt,
      dueDate: reservation.dueDate,
      status: reservation.status,
      daysLate: reservation.daysLate,
      fineAmount: reservation.fineAmount,
    };
  }
}