import { ApiProperty } from "@nestjs/swagger";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class BookListResponseDto extends PaginationDto {
    @ApiProperty({ example: "01HXXXXXXXXXXXXXXXXXXXXX" })
    id: string;

    @ApiProperty({ example: "O guia dos mochileiro das galáxias" })
    title: string;

    @ApiProperty({ example: "Douglas Adams" })
    author: string;

    @ApiProperty({ example: "5" })
    totalCopies: number;

    @ApiProperty({ example: "3" })
    availableCopies: number;

    @ApiProperty({ example: "true" })
    hasAvailable: boolean;
}
