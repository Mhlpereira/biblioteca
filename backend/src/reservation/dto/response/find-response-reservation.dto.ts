import { ApiProperty } from "@nestjs/swagger";

export class FindReservationResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    bookTitle: string;

    @ApiProperty({ nullable: true })
    bookImage: string | null;

    @ApiProperty({ type: Date })
    reservedAt: Date;

    @ApiProperty({ type: Date })
    dueDate: Date;

    @ApiProperty({ nullable: true, type: Date })
    returnedAt: Date | null;

    @ApiProperty()
    status: string;

    @ApiProperty({ nullable: true, type: Number })
    fineAmount: number | null;

    @ApiProperty({ description: 'Indica se a reserva está atrasada' })
    isOverdue: boolean;

    @ApiProperty({ 
        nullable: true, 
        type: Number,
        description: 'Multa potencial calculada para reservas atrasadas não devolvidas' 
    })
    potentialFine: number | null;
}