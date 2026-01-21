import { UpdateClientDto } from "./dto/update-client.dto";
import { CryptoService } from "../common/crypto/crypto.service";
import { Client } from "./entities/client.entity";
import { Repository } from "typeorm";
import { CreateClientDto } from "./dto/create-client.dto";
export declare class ClientService {
    private readonly clientRepository;
    private readonly cryptoService;
    constructor(clientRepository: Repository<Client>, cryptoService: CryptoService);
    create(createClientDto: CreateClientDto): Promise<Client>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateClientDto: UpdateClientDto): string;
    remove(id: number): string;
}
