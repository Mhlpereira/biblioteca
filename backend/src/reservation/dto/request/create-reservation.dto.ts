import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateReservationDto {
    @IsNotEmpty()
    @IsString()
    bookId: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;
}
