import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsDate } from 'class-validator';
import { ReservationStatus } from '../../enum/reservation-status.enum';

export class CreateFullReservationDto {
    @IsNotEmpty()
    @IsString()
    keycloackClientId: string;

    @IsNotEmpty()
    @IsString()
    bookCopyId: string;

    @IsOptional()
    @IsDateString()
    reservedAt?: string;

    @IsNotEmpty()
    @IsDateString()
    dueDate: string;

    @IsOptional()
    @IsEnum(ReservationStatus)
    status?: ReservationStatus;

    @IsOptional()
    @IsDateString()
    returnedAt?: string;

    @IsOptional()
    @IsNumber()
    daysLate?: number;

    @IsOptional()
    @IsNumber()
    fineAmount?: number;
}
