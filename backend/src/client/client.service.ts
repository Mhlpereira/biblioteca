import { BadRequestException, Injectable } from "@nestjs/common";
import { UpdateClientDto } from "./dto/update-client.dto";
import { cpf } from "cpf-cnpj-validator";
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
    ) {}

    async createClient(createClientDto: CreateClientDto) {
        this.validateCpf(createClientDto.cpf);
        await this.verifyUniqueCpf(createClientDto.cpf);

        const client = this.clientRepository.create({
            id: ulid(),
            ...createClientDto
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

    private validateCpf(cpfValue: string) {
        if (!cpf.isValid(cpfValue)) {
            throw new BadRequestException("Cpf inválido");
        }
    }

    private verifiyUniqueCpf(cpf: string) {}
    private async verifyUniqueCpf(cpfValue: string) {
        const exists = await this.clientRepository.findOneBy({ cpf: cpfValue });
        if (exists) {
            throw new BadRequestException("CPF já cadastrado");
        }
    }
}
