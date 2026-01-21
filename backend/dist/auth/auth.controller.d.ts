import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { RegisterOutputDto } from "./dto/output-register.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    createClient(registerDto: RegisterDto): Promise<RegisterOutputDto>;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateAuthDto: UpdateAuthDto): string;
    remove(id: string): string;
}
