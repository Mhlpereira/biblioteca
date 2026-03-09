import { Type } from "class-transformer";
import { IsOptional, IsEnum, IsDate, IsNumber, Min } from "class-validator";
import { ReservationStatus } from "../../enum/reservation-status.enum";

export class UpdateReservationDto {
    @IsOptional()
    @IsEnum(ReservationStatus)
    status?: ReservationStatus;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    returnedAt?: Date;

    @IsOptional()
    @IsNumber()
    @Min(0)
    daysLate?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    fineAmount?: number;
}
