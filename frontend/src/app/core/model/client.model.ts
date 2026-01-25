import { PaginationParams } from "./pagination.model";

export interface UpdateClientDto { name?: string; lastName?: string; }
export interface UpdatePasswordDto { newPassword: string; confirmPassword: string; currentPassword:string }
export interface FindClientParams extends PaginationParams {
    cpf?: string;
    name?: string;
    role?: string;
    active?: boolean;
}