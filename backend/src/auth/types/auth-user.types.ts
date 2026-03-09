import { Role } from "../enum/role.enum";

export interface AuthUser {
    keycloakId: string;
    cpf: string;
    name: string;
    email: string;
    lastName: string;
    role: Role;
    active: boolean;
}