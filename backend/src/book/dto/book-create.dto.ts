import { IsNotEmpty, IsNumber, isString, IsString } from "class-validator";

export class CreateBookDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    author: string;

    @IsNotEmpty()
    @IsNumber()
    totalCopies:number;
}
