import { IsNotEmpty, IsString } from "class-validator";

export class ReturnReservetionDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}
