import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MinLength, Matches } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: "12345678901" })
    @IsString()
    @IsNotEmpty()
    cpf: string;

    @ApiProperty({ example: "Mário" })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "Henrique" })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: "Senha@123" })
    @IsString()
    password: string;

    @ApiProperty({ example: "Senha@123" })
    @IsString()
    confirmPassword: string;
}
