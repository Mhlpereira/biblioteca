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
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: "Senha deve conter maiúscula, minúscula, número e caractere especial",
    })
    password: string;

    @ApiProperty({ example: "Senha@123" })
    @IsString()
    confirmPassword: string;
}
