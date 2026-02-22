import { Role } from "../enum/role.enum";

export type JwtPayload = {
    sub: string;
    keycloakSub: string;
    email: string;
    cpf: string;
    name: string;
    lastName: string;
    role: Role;
    active: boolean;
    iat?: number;
    exp?: number;
};
