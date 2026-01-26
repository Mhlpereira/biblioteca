import { ApiProperty } from "@nestjs/swagger";
import { ReservationStatus } from "../enum/reservation-status.enum";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class FindReservationResponseDto extends PaginationDto{
    @ApiProperty()
    id: string;

    @ApiProperty()
    clientName: string;

    @ApiProperty()
    bookTitle: string;

    @ApiProperty({ nullable: true })
    bookImage: string | undefined;

    @ApiProperty({ type: Date })
    reservedAt: Date;

    @ApiProperty({ type: Date })
    dueDate: Date;

    @ApiProperty({ nullable: true, type: Date })
    returnedAt?: Date | undefined;

    @ApiProperty({ enum: ReservationStatus })
    status: ReservationStatus;

    @ApiProperty({ nullable: true, type: Number })
    fineAmount?: number | undefined;

    @ApiProperty({ description: 'Indica se a reserva está atrasada' })
    isOverdue: boolean;

    @ApiProperty({ 
        nullable: true, 
        type: Number,
        description: 'Multa potencial calculada para reservas atrasadas não devolvidas' 
    })
    potentialFine?: number;
}