import { ApiProperty } from "@nestjs/swagger";

export class FindReservetaionResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    clientName: string;

    @ApiProperty()
    bookTitle: string;

    @ApiProperty()
    bookImage: string;

    @ApiProperty()
    reservedAt: Date;

    @ApiProperty()
    dueDate: Date;

    @ApiProperty()
    returnedAt?: Date;

    @ApiProperty()
    status: string;
}
