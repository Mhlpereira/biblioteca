import { Role } from "../enums/role.enum";

export interface User {
    id: string;
    name: string;
    lastName: string;
    cpf: string;
    role: Role; 
    active: boolean;
}