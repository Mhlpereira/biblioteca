import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { ClientService } from "../client/client.service";
import { CryptoService } from "../common/crypto/crypto.service";
import { JwtPayload } from "./types/jwt-payload.types";
import { RegisterResult } from "./interface/registerResult.interface";
import { Role } from "./enum/role.enum";
import { Register } from "./interface/register.interface";
import { use } from "passport";

@Injectable()
export class AuthService {
    constructor(
        private readonly clientService: ClientService,
        private readonly cryptoService: CryptoService
    ) {}

    async createClient(register: Register): Promise<RegisterResult> {
        const client = await this.clientService.createClient({
            cpf: register.cpf,
            name: register.name,
            email: register.email,
            keycloakId: register.keycloakId,
            lastName: register.lastName,
            active: true,
            role: Role.USER,
        });

        return {
            id: client.id,
            email: client.email,
            name: client.name,
            lastName: client.lastName,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            role: client.role,
        };
    }

    async ensureClientFromToken(user: JwtPayload) {
        console.log("PAYLOAD COMPLETO:", JSON.stringify(user, null, 2)); // ← adicione
        if (!user?.sub) {
            throw new UnauthorizedException("Token inválido");
        }

        const keycloakRoles = user.realm_access?.roles ?? [];
        const role = keycloakRoles.includes("ADMIN") ? Role.ADMIN : Role.USER;

        let client = await this.clientService.findByKeycloakId(user.sub);

        if (!client) {
            client = await this.clientService.createClientFromKeycloak({
                keycloakId: user.sub,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                active: true,
                cpf: user.cpf,
                role,
            });
        } else {
            if (client.role !== role) {
                client = await this.clientService.updateRole(client.id, role);
            }
        }

        if (!client!.active) {
            throw new UnauthorizedException("Usuário não autorizado no sistema");
        }

        return client;
    }

    async validateUserFromToken(user: JwtPayload) {
        const client = await this.clientService.findByKeycloakId(user.sub);

        if (!client || !client.active) {
            throw new UnauthorizedException("Usuário não autorizado no sistema");
        }

        return client;
    }

    async me(user: JwtPayload) {
        console.log("PAYLOAD COMPLETO:", JSON.stringify(user, null, 2)); // ← adicione
        const client = await this.ensureClientFromToken(user);

        return {
            id: client.id,
            keycloakId: client.keycloakId,
            cpf: client.cpf,
            name: client.name,
            lastName: client.lastName,
            email: client.email,
            role: Role.ADMIN,
            active: true,
        };
    }
}
