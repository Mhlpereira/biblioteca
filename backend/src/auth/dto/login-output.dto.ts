import { ApiProperty } from "@nestjs/swagger";

export class LoginOutputDto {
    @ApiProperty({ example: "01HXXXXXXXXXXXXXXXXXXXXX" })
    id: string;
    @ApiProperty({ example: "Mário" })
    name: string;
    @ApiProperty({ example: "123.***.***-01" })
    cpf: string;
}
