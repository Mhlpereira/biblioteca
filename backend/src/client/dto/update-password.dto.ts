import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, Matches, IsNotEmpty } from "class-validator";

export class UpdatePasswordDto {
    @ApiProperty({ example: "Senha@123" })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: "Senha deve conter maiúscula, minúscula, número e caractere especial",
    })
    newPassword: string;

    @ApiProperty({ example: "Senha@123" })
    @IsString()
    confirmPassword: string;

    @ApiProperty({ example: "Senha@123" })
    @IsNotEmpty()
    @IsString()
    currentPassword: string;
}
