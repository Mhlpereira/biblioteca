import { IsBoolean, IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { ReservationStatus } from "../enum/reservation-status.enum";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class FindReservationDto extends PaginationDto{
    @IsOptional()
    @IsString()
    clientId?: string;

    @IsOptional()
    @IsString()
    bookId?: string;

    @IsOptional()
    @IsDate()
    reservedAt?: string;

    @IsOptional()
    @IsDate()
    dueDate?: string;

    @IsOptional()
    @IsDate()
    returnedAt?: string;

    @IsEnum(ReservationStatus)
    @IsOptional()
    status?: ReservationStatus;

    @IsOptional()
    overdueOnly?: boolean;
}
