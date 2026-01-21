import { BadRequestException, Injectable } from "@nestjs/common";
import { UpdateClientDto } from "./dto/update-client.dto";
import validarCpf from "validar-cpf";
import { RegisterDto } from "../auth/dto/register.dto";
import { CryptoService } from "../common/crypto/crypto.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Client } from "./entities/client.entity";
import { Repository } from "typeorm";
import { CreateClientDto } from "./dto/create-client.dto";

@Injectable()
export class ClientService {
    constructor(
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        private readonly cryptoService: CryptoService
    ) {}

    async create(createClientDto: CreateClientDto) {
        if (!validarCpf(createClientDto.cpf)) {
            throw new BadRequestException("Cpf inválido");
        }

        const existingClient = await this.clientRepository.findOneBy({ cpf: createClientDto.cpf });
        if (existingClient) {
            throw new BadRequestException("CPF já cadastrado");
        }

        const client = this.clientRepository.create(createClientDto);

        return this.clientRepository.save(client);
    }

    findAll() {
        return `This action returns all client`;
    }

    findOne(id: number) {
        return `This action returns a #${id} client`;
    }

    update(id: number, updateClientDto: UpdateClientDto) {
        return `This action updates a #${id} client`;
    }

    remove(id: number) {
        return `This action removes a #${id} client`;
    }
}
