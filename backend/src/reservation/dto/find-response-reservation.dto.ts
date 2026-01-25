import { ApiProperty } from "@nestjs/swagger";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class FindReservationResponseDto extends PaginationDto {
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
