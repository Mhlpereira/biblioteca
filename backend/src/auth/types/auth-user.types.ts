import { Role } from "../enum/role.enum";

export type AuthUser = {
  sub: string;
  cpf: string;
  name: string;
  email: string;
  lastName: string;
  role: Role;
  active:boolean;
};