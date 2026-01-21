import { RegisterDto } from "./dto/register.dto";
import { ClientService } from "../client/client.service";
import { CryptoService } from "../common/crypto/crypto.service";
import { RegisterOutputDto } from "./dto/output-register.dto";
export declare class AuthService {
    private readonly clientService;
    private readonly cryptoService;
    constructor(clientService: ClientService, cryptoService: CryptoService);
    createClient(registerDto: RegisterDto): Promise<RegisterOutputDto>;
    getById(id: number): Promise<string>;
    update(id: number, updateAuthDto: UpdateAuthDto): string;
    remove(id: number): string;
}
