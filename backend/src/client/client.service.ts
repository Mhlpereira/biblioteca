import { BadRequestException, Injectable } from "@nestjs/common";
import { UpdateClientDto } from "./dto/update-client.dto";
import { cpf } from "cpf-cnpj-validator"; 
import { CryptoService } from "../common/crypto/crypto.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Client } from "./entities/client.entity";
import { Repository } from "typeorm";
import { CreateClientDto } from "./dto/create-client.dto";
import { ulid } from "ulid";

@Injectable()
export class ClientService {
    constructor(
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        private readonly cryptoService: CryptoService
    ) {}

    async createClient(createClientDto: CreateClientDto) {
        if (!cpf.isValid(createClientDto.cpf)) { // Usando cpf.isValid
            throw new BadRequestException("Cpf inválido");
        }

        const existingClient = await this.clientRepository.findOneBy({ cpf: createClientDto.cpf });
        if (existingClient) {
            throw new BadRequestException("CPF já cadastrado");
        }

        const client = this.clientRepository.create({
            id: ulid(), 
            cpf: createClientDto.cpf,
            name: createClientDto.name,
            lastName: createClientDto.lastName,
            password: createClientDto.password,
        });

        return this.clientRepository.save(client);
    }

    findAll() {
        return `This action returns all client`;
    }

    async getById(id: string) {
        return `This action returns a #${id} client`;
    }

    update(id: string, updateClientDto: UpdateClientDto) {
        return `This action updates a #${id} client`;
    }

    remove(id: number) {
        return `This action removes a #${id} client`;
    }
}
