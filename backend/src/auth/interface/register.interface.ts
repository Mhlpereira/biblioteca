import { Role } from "../enum/role.enum";

export interface Register {
    cpf: string;
    name: string;
    lastName: string;
    password: string;
    confirmPassword: string;
}
