import { IsNotEmpty, IsNumber, isString, IsString, Min } from "class-validator";

export class CreateBookDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    author: string;

    @IsNotEmpty()
    @Min(1)
    quantity: number;
}
