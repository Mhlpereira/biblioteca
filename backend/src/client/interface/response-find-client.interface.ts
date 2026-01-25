import { Role } from "../../auth/enum/role.enum";


export class ResponseFindClient {
    id: string;
    cpf?: string;
    name?: string;
    lastName?: string;
    active?: boolean;
    role?: Role;
}