export interface LoginResult {
    accessToken: string;
    user: {
        id: string;
        name: string;
        cpf: string;
    };
}
