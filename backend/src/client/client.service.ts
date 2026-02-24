import {
    BadRequestException,
    Injectable,
    NotFoundException,
    Inject,
    forwardRef,
    UnauthorizedException,
} from "@nestjs/common";
import { cpf } from "cpf-cnpj-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { Client } from "./entities/client.entity";
import { Repository } from "typeorm";
import { CreateClient } from "./interface/create-client.interface";
import { ulid } from "ulid";
import { UpdateClient } from "./interface/update-client.interface";
import { CryptoService } from "../common/crypto/crypto.service";
import { ReservationService } from "../reservation/reservation.service";
import { FindClient } from "./interface/find-client.interface";
import { PaginatedResult } from "../common/interfaces/paginated.interface";
import { ResponseFindClient } from "./interface/response-find-client.interface";
import { Role } from "../auth/enum/role.enum";

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
        await this.verifyUniqueEmail(createClient.cpf);

        const client = this.clientRepository.create({
            id: ulid(),
            ...createClient,
        });

        return this.clientRepository.save(client);
    }

    async createClientFromKeycloak(data: {
        keycloakId: string;
        email: string;
        name: string;
        lastName: string;
        active: boolean;
        cpf?: string | null;
        role: Role;
    }) {
        const client = this.clientRepository.create({
            id: ulid(),
            keycloakId: data.keycloakId,
            email: data.email,
            name: data.name,
            lastName: data.lastName,
            active: data.active,
            role: data.role,
            cpf: data.cpf ?? null, 
            
        });
        return this.clientRepository.save(client);
    }

    async findByIdorThrow(id: string): Promise<Client> {
        const client = await this.clientRepository.findOneBy({ id });
        if (!client) {
            throw new NotFoundException("Cliente não encontrado.");
        }
        return client;
    }

    async findByEmail(email: string): Promise<Client | null> {
        return await this.clientRepository.findOneBy({ email });
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

    async findByKeycloakId(keycloakId: string): Promise<Client | null> {
        return this.clientRepository.findOne({
            where: { keycloakId },
        });
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

    async toogleStatus() {}

    async deleteClient(id: string) {
        const client = await this.findByIdorThrow(id);

        const { data: reservations } = await this.reservationService.findAuthClientReservation(client.id);
        if (reservations) {
            for (const reservation of reservations) {
                await this.reservationService.remove(reservation.id);
            }
        }

        client.active = false;
        await this.clientRepository.save(client);
    }

    private validateCpf(cpfValue: string) {
        if (!cpf.isValid(cpfValue)) {
            throw new BadRequestException("CPF inválido");
        }
    }

    private async verifyUniqueEmail(email: string) {
        const exists = await this.clientRepository.findOneBy({ email: email });
        if (exists) {
            throw new BadRequestException("CPF já cadastrado");
        }
    }

    private validatePassword(newPassword: string, confirmPassword: string) {
        if (newPassword !== confirmPassword) {
            throw new BadRequestException("As senhas não conferem");
        }
    }

    async updateRole(id: string, role: Role) {
        await this.clientRepository.update({ id }, { role });
        const client = await this.clientRepository.findOneBy({ id });
        if (!client) throw new UnauthorizedException("Cliente não encontrado");
        return client;
    }
}
