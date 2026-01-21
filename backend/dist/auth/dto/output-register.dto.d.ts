import { Client } from "../../client/entities/client.entity";
export declare class RegisterOutputDto {
    id: string;
    cpf: string;
    name: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(client: Client);
}
