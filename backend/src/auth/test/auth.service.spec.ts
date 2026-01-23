import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { ClientService } from "../../client/client.service";
import { CryptoService } from "../../common/crypto/crypto.service";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { AuthUser } from "../types/auth-user.types";

describe("AuthService", () => {
    let service: AuthService;
    let clientService: ClientService;
    let cryptoService: CryptoService;
    let jwtService: JwtService;

    const mockClientService = {
        createClient: jest.fn(),
        findByCpf: jest.fn(),
    };

    const mockCryptoService = {
        hash: jest.fn(),
        compare: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: ClientService,
                    useValue: mockClientService,
                },
                {
                    provide: CryptoService,
                    useValue: mockCryptoService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        clientService = module.get<ClientService>(ClientService);
        cryptoService = module.get<CryptoService>(CryptoService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createClient", () => {
        const validRegisterDto: RegisterDto = {
            cpf: "12345678900",
            name: "João",
            lastName: "Silva",
            password: "senha123",
            confirmPassword: "senha123",
        };

        it("should create a client successfully", async () => {
            const hashedPassword = "hashed_senha123";
            const createdClient = {
                id: "client-id-123",
                cpf: "12345678900",
                name: "João",
                lastName: "Silva",
                password: hashedPassword,
                createdAt: new Date("2024-01-01"),
                updatedAt: new Date("2024-01-01"),
            };

            mockCryptoService.hash.mockResolvedValue(hashedPassword);
            mockClientService.createClient.mockResolvedValue(createdClient);

            const result = await service.createClient(validRegisterDto);

            expect(cryptoService.hash).toHaveBeenCalledWith("senha123");
            expect(cryptoService.hash).toHaveBeenCalledTimes(1);

            expect(clientService.createClient).toHaveBeenCalledWith({
                cpf: "12345678900",
                name: "João",
                lastName: "Silva",
                password: hashedPassword,
            });
            expect(clientService.createClient).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                id: "client-id-123",
                cpf: "12345678900",
                name: "João",
                lastName: "Silva",
                createdAt: createdClient.createdAt,
                updatedAt: createdClient.updatedAt,
            });

            expect(result).not.toHaveProperty("password");
        });

        it("should throw BadRequestException when passwords do not match", async () => {
            const invalidRegisterDto: RegisterDto = {
                ...validRegisterDto,
                password: "senha123",
                confirmPassword: "senha456", 
            };

            await expect(service.createClient(invalidRegisterDto)).rejects.toThrow(BadRequestException);

            await expect(service.createClient(invalidRegisterDto)).rejects.toThrow("As senhas não coincidem");

            expect(cryptoService.hash).not.toHaveBeenCalled();
            expect(clientService.createClient).not.toHaveBeenCalled();
        });

        it("should propagate errors from clientService", async () => {
            mockCryptoService.hash.mockResolvedValue("hashed_password");
            mockClientService.createClient.mockRejectedValue(new BadRequestException("CPF já cadastrado"));

            await expect(service.createClient(validRegisterDto)).rejects.toThrow("CPF já cadastrado");

            expect(cryptoService.hash).toHaveBeenCalled();
            expect(clientService.createClient).toHaveBeenCalled();
        });

        it("should propagate errors from cryptoService", async () => {
            mockCryptoService.hash.mockRejectedValue(new Error("Erro ao criptografar senha"));

            await expect(service.createClient(validRegisterDto)).rejects.toThrow("Erro ao criptografar senha");

            expect(cryptoService.hash).toHaveBeenCalled();
            expect(clientService.createClient).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        const validLoginDto: LoginDto = {
            cpf: "12345678900",
            password: "senha123",
        };

        const mockClient = {
            id: "client-id-123",
            cpf: "12345678900",
            name: "João Silva",
            lastName: "Silva",
            password: "hashed_senha123",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it("should login successfully and return access token", async () => {
            const expectedToken = "jwt-token-abc123";

            mockClientService.findByCpf.mockResolvedValue(mockClient);
            mockCryptoService.compare.mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue(expectedToken);

            const result = await service.login(validLoginDto);

            expect(clientService.findByCpf).toHaveBeenCalledWith("12345678900");
            expect(clientService.findByCpf).toHaveBeenCalledTimes(1);

            expect(cryptoService.compare).toHaveBeenCalledWith("senha123", "hashed_senha123");
            expect(cryptoService.compare).toHaveBeenCalledTimes(1);

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: "client-id-123",
                cpf: "12345678900",
                name: "João Silva",
            });
            expect(jwtService.sign).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                accessToken: expectedToken,
                user: {
                    id: "client-id-123",
                    name: "João Silva",
                    cpf: "123.***.***-00", 
                },
            });
        });

        it("should throw UnauthorizedException when client is not found", async () => {
            mockClientService.findByCpf.mockResolvedValue(null);

            await expect(service.login(validLoginDto)).rejects.toThrow(UnauthorizedException);

            await expect(service.login(validLoginDto)).rejects.toThrow("Credenciais inválidas");

            expect(clientService.findByCpf).toHaveBeenCalledWith("12345678900");
            expect(cryptoService.compare).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it("should throw UnauthorizedException when password is invalid", async () => {
            mockClientService.findByCpf.mockResolvedValue(mockClient);
            mockCryptoService.compare.mockResolvedValue(false); // Senha incorreta

            await expect(service.login(validLoginDto)).rejects.toThrow(UnauthorizedException);

            await expect(service.login(validLoginDto)).rejects.toThrow("Credenciais inválidas");

            expect(clientService.findByCpf).toHaveBeenCalled();
            expect(cryptoService.compare).toHaveBeenCalledWith("senha123", "hashed_senha123");
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it("should mask CPF in the response", async () => {
            mockClientService.findByCpf.mockResolvedValue(mockClient);
            mockCryptoService.compare.mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue("token");

            const result = await service.login(validLoginDto);

            expect(result.user.cpf).toBe("123.***.***-00");
            expect(result.user.cpf).not.toBe("12345678900");
        });

        it("should propagate errors from findByCpf", async () => {
            mockClientService.findByCpf.mockRejectedValue(new Error("Database connection error"));

            await expect(service.login(validLoginDto)).rejects.toThrow("Database connection error");
        });
    });

    describe("me", () => {
        it("should return user data from AuthUser", () => {
            const authUser: AuthUser = {
                userId: "user-123",
                cpf: "12345678900",
                name: "João Silva",
            };

            const result = service.me(authUser);

            expect(result).toEqual({
                id: "user-123",
                cpf: "12345678900",
                name: "João Silva",
            });
        });

        it("should handle different user data", () => {
            const authUser: AuthUser = {
                userId: "user-456",
                cpf: "98765432100",
                name: "Maria Santos",
            };

            const result = service.me(authUser);

            expect(result).toEqual({
                id: "user-456",
                cpf: "98765432100",
                name: "Maria Santos",
            });
        });

        it("should map userId to id correctly", () => {
            const authUser: AuthUser = {
                userId: "unique-user-id",
                cpf: "11111111111",
                name: "Test User",
            };

            const result = service.me(authUser);

            expect(result.id).toBe("unique-user-id");
            expect(result).not.toHaveProperty("userId");
        });
    });
});
