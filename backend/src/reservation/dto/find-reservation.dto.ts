import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { ReservationStatus } from "../enum/reservation-status.enum";

export class FindReservationDto {
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
}
