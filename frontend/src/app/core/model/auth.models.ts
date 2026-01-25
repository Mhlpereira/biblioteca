export interface LoginRequest {
    cpf: string;
    password: string;
}

export interface RegisterRequest {
    cpf: string;
    name: string;
    lastName: string;
    password: string;
    confirmPassword: string;
}
