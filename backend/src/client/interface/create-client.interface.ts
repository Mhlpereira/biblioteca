import { Role } from "../../auth/enum/role.enum";

export interface CreateClient {
    cpf: string;
    name: string;
    lastName: string;
    password: string;
    active: boolean;
    role: Role;
}
