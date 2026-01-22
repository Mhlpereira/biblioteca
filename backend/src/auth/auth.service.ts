import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { ClientService } from "../client/client.service";
import { CryptoService } from "../common/crypto/crypto.service";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./types/jwt-payload.types";
import { maskCpf } from "../common/helper/cpf-mask.helper";
import { AuthUser } from "./types/auth-user.types";
import { RegisterResult } from "./interface/registerResult.interface";
import { LoginResult } from "./interface/loginResult.interface";

@Injectable()
export class AuthService {
    constructor(
        private readonly clientService: ClientService,
        private readonly cryptoService: CryptoService,
        private readonly jwtService: JwtService
    ) {}

    async createClient(registerDto: RegisterDto): Promise<RegisterResult> {
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException("As senhas não coincidem");
        }

        const hashedPassword = await this.cryptoService.hash(registerDto.password);

        const client = await this.clientService.createClient({
            cpf: registerDto.cpf,
            name: registerDto.name,
            lastName: registerDto.lastName,
            password: hashedPassword,
        });

        return {
            id: client.id,
            cpf: client.cpf,
            name: client.name,
            lastName: client.lastName,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        };
    }

    async login(loginDto: LoginDto): Promise<LoginResult> {

        const client = await this.clientService.findByCpf(loginDto.cpf);

        if(!client){
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const isPasswordValid = await this.cryptoService.compare(
            loginDto.password,
            client.password
        );

        if(!isPasswordValid){
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const payload: JwtPayload = {
            sub: client.id,
            cpf: client.cpf,
            name: client.name
        }

        return{
            accessToken: this.jwtService.sign(payload),
            user:{
                id: client.id,
                name: client.name,
                cpf: maskCpf(client.cpf)
            }
        }
        
    }

    me(user: AuthUser){
        return{
            id: user.userId,
            cpf: user.cpf,
            name: user.name
        };
    }
}
