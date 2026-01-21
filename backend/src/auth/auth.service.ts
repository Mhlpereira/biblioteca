import { BadRequestException, Injectable } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { ClientService } from "../client/client.service";
import { CryptoService } from "../common/crypto/crypto.service";
import { RegisterOutputDto } from "./dto/output-register.dto";
import { maskCpf } from "../common/helper/cpf-mask.helper";

@Injectable()
export class AuthService {
    constructor(
        private readonly clientService: ClientService,
        private readonly cryptoService: CryptoService
    ) {}

    async createClient(registerDto: RegisterDto): Promise<RegisterOutputDto> {
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

    async getById(id: number) {
        return `This action returns a #${id} auth`;
    }

    update(id: number, updateAuthDto: UpdateAuthDto) {
        return `This action updates a #${id} auth`;
    }

    remove(id: number) {
        return `This action removes a #${id} auth`;
    }
}
