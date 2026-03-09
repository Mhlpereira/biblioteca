import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddBookCopyDto {
    @IsNotEmpty()
    @IsString()
    bookId: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}
