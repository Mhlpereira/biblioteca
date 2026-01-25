import { BadRequestException, Injectable, NotFoundException, Inject, forwardRef } from "@nestjs/common";
import { cpf } from "cpf-cnpj-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { Client } from "./entities/client.entity";
import { Repository } from "typeorm";
import { CreateClient } from "./interface/create-client.interface";
import { ulid } from "ulid";
import { UpdateClient } from "./interface/update-client.interface";
import { CryptoService } from "../common/crypto/crypto.service";
import { UpdatePassword } from "./interface/update-password.interface";
import { ReservationService } from "../reservation/reservation.service";
import { FindClient } from "./interface/find-client.interface";
import { PaginatedResult } from "../common/interfaces/paginated.interface";
import { ResponseFindClient } from "./interface/response-find-client.interface";

@Injectable()
export class ClientService {
    constructor(
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        private readonly cryptoService: CryptoService,
        @Inject(forwardRef(() => ReservationService))
        private readonly reservationService: ReservationService
    ) {}

    async createClient(createClient: CreateClient) {
        this.validateCpf(createClient.cpf);
        await this.verifyUniqueCpf(createClient.cpf);

        const client = this.clientRepository.create({
            id: ulid(),
            ...createClient,
        });

        return this.clientRepository.save(client);
    }


    async findByIdorThrow(id: string): Promise<Client> {
        const client = await this.clientRepository.findOneBy({ id });
        if(!client){
            throw new NotFoundException("Cliente não encontrado.")
        }
        return client;
    }

    async findByCpf(cpf: string): Promise<Client | null> {
        return await this.clientRepository.findOneBy({ cpf });
    }

    async update(id: string, data: UpdateClient) {
        const client = await this.findByIdorThrow(id);

        if (data.name !== undefined) {
            client.name = data.name;
        }

        if (data.lastName !== undefined) {
            client.lastName = data.lastName;
        }

        return this.clientRepository.save(client);
    }

    async changePassword(id: string, data: UpdatePassword) {
        const client = await this.findByIdorThrow(id);
        
        this.validatePassword(data.newPassword, data.confirmPassword);

        const isValid = await this.cryptoService.compare(data.currentPassword, client.password);

        if (!isValid) {
            throw new BadRequestException("Senha atual inválida");
        }

        client.password = await this.cryptoService.hash(data.newPassword);

        await this.clientRepository.save(client);

        return {message: "Senha alterada com sucesso!"};
    }

    async findAll(findClient: FindClient): Promise<PaginatedResult<ResponseFindClient>> {
        const page = findClient.page || 1;
        const limit = findClient.limit || 10;
        const skip = (page - 1) * limit;

        const qb = this.clientRepository
            .createQueryBuilder("client")
            .select([
                "client.id AS id",
                "client.cpf AS cpf",
                "client.name AS name",
                "client.lastName AS lastName",
                "client.active AS active",
                "client.role AS role",
                "client.createdAt AS createdAt",
                "client.updatedAt AS updatedAt",
            ]);


        if (findClient.cpf) {
            qb.andWhere("client.cpf LIKE :cpf", { cpf: `%${findClient.cpf}%` });
        }

        if (findClient.name) {
            qb.andWhere("client.name LIKE :name", { name: `%${findClient.name}%` });
        }

        if (findClient.lastName) {
            qb.andWhere("client.lastName LIKE :lastName", { lastName: `%${findClient.lastName}%` });
        }

        if (findClient.active !== undefined) {
            qb.andWhere("client.active = :active", { active: findClient.active });
        }

        if (findClient.role) {
            qb.andWhere("client.role = :role", { role: findClient.role });
        }

        const countQb = qb.clone().select("COUNT(*)", "total").getRawOne();
        const total = (await countQb).total;

        qb.take(limit).skip(skip);

        const raw = await qb.getRawMany();

        const data = raw.map(r => ({
            id: r.id,
            cpf: r.cpf,
            name: r.name,
            lastName: r.lastname,
            active: r.active,
            role: r.role,
        }));

        const lastPage = Math.ceil(total / limit);

        return {
            data,
            meta: {
                total,
                page,
                lastPage,
            },
        };
    }

    async toogleStatus(){}

    async deleteClient(id:string){
        const client = await this.findByIdorThrow(id);

        const {data: reservations} = await this.reservationService.findAuthClientReservation(client.id);
        if(reservations){
            for(const reservation of reservations){
                await this.reservationService.remove(reservation.id)
            }
        }

        client.active = false
    }

    private validateCpf(cpfValue: string) {
        if (!cpf.isValid(cpfValue)) {
            throw new BadRequestException("CPF já cadastrado");
        }
    }

    private async verifyUniqueCpf(cpfValue: string) {
        const exists = await this.clientRepository.findOneBy({ cpf: cpfValue });
        if (exists) {
            throw new BadRequestException("CPF já cadastrado");
        }
    }

    private validatePassword(newPassword: string, confirmPassword: string) {
        if(newPassword !== confirmPassword){
        throw new BadRequestException("As senhas não conferem");
        }
    }
}
