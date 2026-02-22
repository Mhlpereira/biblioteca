import { Role } from "../../auth/enum/role.enum";

export interface CreateClient {
    cpf: string;
    name: string;
    email:string;
    keycloakId: string;
    lastName: string;
    active: boolean;
    role: Role;
}
