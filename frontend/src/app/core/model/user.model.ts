import { Role } from "../enums/role.enum";

export interface User {
    id: string;
    name: string;
    cpf: string;
    role: Role; 
    active: boolean;
}