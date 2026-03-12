import { Role } from "../enums/role.enum";

export interface User {
    id: string;
    keycloakId: string;
    name: string;
    lastName: string;
    email: string;
    cpf: string;
    role: Role;
    active: boolean;
}