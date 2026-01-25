import { ApiProperty } from "@nestjs/swagger";

export class PaginatedResponseDto<T> {
    @ApiProperty({ isArray: true })
    data: T[];

    @ApiProperty()
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}
