import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class AddBookCopyDto{

    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsNumber()
    numberCopies: number;
}