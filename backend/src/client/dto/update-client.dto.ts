import { PartialType } from "@nestjs/mapped-types";
import { RegisterDto } from "../../auth/dto/register.dto";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateClientDto extends PartialType(RegisterDto) {
    @ApiProperty({ example: "Mário" })
    @IsString()
    @IsNotEmpty()
    name: string | undefined;

    @ApiProperty({ example: "Henrique" })
    @IsString()
    @IsNotEmpty()
    lastName?: string | undefined;
}
