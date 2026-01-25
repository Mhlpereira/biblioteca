import { Role } from "../enum/role.enum";

export interface RegisterResult {
    id: string;
    cpf: string;
    name: string;
    lastName: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
