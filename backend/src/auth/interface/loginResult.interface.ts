import { Role } from "../enum/role.enum";

export interface LoginResult {
    accessToken: string;
    user: {
        id: string;
        name: string;
        cpf: string;
        role: Role;
        active: boolean;
    };
}
