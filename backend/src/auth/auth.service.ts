import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { ClientService } from "../client/client.service";
import { CryptoService } from "../common/crypto/crypto.service";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./types/jwt-payload.types";
import { maskCpf } from "../common/helper/cpf-mask.helper";
import { RegisterResult } from "./interface/registerResult.interface";
import { LoginResult } from "./interface/loginResult.interface";
import { Role } from "./enum/role.enum";
import { Register } from "./interface/register.interface";

@Injectable()
export class AuthService {
    constructor(
        private readonly clientService: ClientService,
        private readonly cryptoService: CryptoService,
        private readonly jwtService: JwtService
    ) {}

    async createClient(register: Register): Promise<RegisterResult> {
        if (register.password !== register.confirmPassword) {
            throw new BadRequestException("As senhas não coincidem");
        }

        const hashedPassword = await this.cryptoService.hash(register.password);

        const client = await this.clientService.createClient({
            cpf: register.cpf,
            name: register.name,
            lastName: register.lastName,
            password: hashedPassword,
            active:true,
            role: Role.USER,
        });

        return {
            id: client.id,
            cpf: client.cpf,
            name: client.name,
            lastName: client.lastName,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            role: client.role,
        };
    }

    async login(loginDto: LoginDto): Promise<LoginResult> {
        const client = await this.validateCredentials(loginDto.cpf, loginDto.password);

        const payload: JwtPayload = {
            sub: client.id,
            cpf: client.cpf,
            name: client.name,
            role: client.role,
            active: client.active
        };

        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: client.id,
                name: client.name,
                cpf: maskCpf(client.cpf),
                role: client.role,
                active: client.active
            },
        };
    }

    async validateCredentials(cpf: string, password: string) {
        const client = await this.clientService.findByCpf(cpf);

        if (!client || !client.active) {
            throw new UnauthorizedException("Credenciais inválidas");
        }

        const isValid = await this.cryptoService.compare(password, client.password);

        if (!isValid) {
            throw new UnauthorizedException("Credenciais inválidas");
        }

        return client;
    }

    me(user: JwtPayload) {
        return {
            id: user.sub,
            cpf: user.cpf,
            name: user.name,
            role: user.role,
            active: user.active
        };
    }
}
