import { Role } from "../enum/role.enum";

export type AuthUser = {
  sub: string;
  cpf: string;
  name: string;
  role: Role;
};