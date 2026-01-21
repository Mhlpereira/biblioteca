import { UpdateClientDto } from './dto/update-client.dto';
import { ClientService } from './client.service';
export declare class ClientController {
    private readonly clientService;
    constructor(clientService: ClientService);
    getById(id: string): Promise<any>;
    update(id: string, updateClientDto: UpdateClientDto): Promise<string>;
    remove(id: string): string;
}
