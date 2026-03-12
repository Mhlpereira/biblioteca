import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos numéricos' })
    cpf: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'E-mail inválido' })
    email: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, undefined, { message: 'Senha deve ter no mínimo 6 caracteres' })
    password: string;
}
