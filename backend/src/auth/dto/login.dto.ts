import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: "123.456.789-10" })
    @IsString()
    @IsNotEmpty()
    cpf: string;

    @ApiProperty({ example: "Senha@123" })
    @IsString()
    password: string;
}
