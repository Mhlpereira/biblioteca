import { ApiProperty } from "@nestjs/swagger";
import { Client } from "../../client/entities/client.entity";
import { maskCpf } from "../../common/helper/cpf-mask.helper";

export class RegisterOutputDto {
    @ApiProperty({ example: "01HXXXXXXXXXXXXXXXXXXXXX" })
    id: string;

    @ApiProperty({ example: "123.***.***-01" })
    cpf: string;

    @ApiProperty({ example: "João" })
    name: string;

    @ApiProperty({ example: "Silva" })
    lastName: string;

    @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
    createdAt: Date;

    @ApiProperty({ example: "2023-01-01T00:00:00.000Z" })
    updatedAt: Date;

    constructor(client: Client) {
        this.id = client.id;
        this.cpf = maskCpf(client.cpf);
        this.name = client.name;
        this.lastName = client.lastName;
        this.createdAt = client.createdAt;
        this.updatedAt = client.updatedAt;
    }
}
