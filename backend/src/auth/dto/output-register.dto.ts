import { ApiProperty } from "@nestjs/swagger";

export class RegisterOutputDto {
    @ApiProperty({ example: "01HXXXXXXXXXXXXXXXXXXXXX", description: "ID único do cliente" })
    id: string;

    @ApiProperty({ example: "12345678901", description: "CPF do cliente" })
    cpf: string;

    @ApiProperty({ example: "João", description: "Nome do cliente" })
    name: string;

    @ApiProperty({ example: "Silva", description: "Sobrenome do cliente" })
    lastName: string;

    @ApiProperty({ example: "2023-01-01T00:00:00.000Z", description: "Data de criação" })
    createdAt: Date;

    @ApiProperty({ example: "2023-01-01T00:00:00.000Z", description: "Data de atualização" })
    updatedAt: Date;
}