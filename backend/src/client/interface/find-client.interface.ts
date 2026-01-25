import { Role } from "../../auth/enum/role.enum";

export class FindClient {
    cpf?: string;
    name?: string;
    lastName?: string;
    active?: boolean;
    role?: Role;
    page?: number;
    limit?: number;
}
