

export class LoginOutputDto{

    accessToken: string;

    user: {
        id: string;
        name: string;
        cpf: string;
    }
}