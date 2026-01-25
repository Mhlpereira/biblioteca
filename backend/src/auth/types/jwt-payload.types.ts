import { Role } from "../enum/role.enum";

export type JwtPayload = {
  sub: string;
  cpf: string;
  name: string;
  role: Role;
  active: boolean;
  iat?: number;
  exp?: number;
};