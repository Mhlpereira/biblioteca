import { Role } from "../enum/role.enum";

export interface Register {
    cpf: string;
    email:string;
    keycloakId: string;
    name: string;
    lastName: string;
}
