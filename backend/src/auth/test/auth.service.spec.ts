import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { ClientService } from "../../client/client.service";
import { CryptoService } from "../../common/crypto/crypto.service";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "../dto/login.dto";
import { Role } from "../enum/role.enum";

describe("AuthService", () => {
    let service: AuthService;

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
                { provide: ClientService, useValue: mockClientService },
                { provide: CryptoService, useValue: mockCryptoService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createClient", () => {
        const register = {
            cpf: "12345678900",
            name: "João",
            lastName: "Silva",
            password: "123456",
            confirmPassword: "123456",
        };

        it("creates client with default role and active true", async () => {
            mockCryptoService.hash.mockResolvedValue("hashed");
            mockClientService.createClient.mockResolvedValue({
                id: "1",
                cpf: register.cpf,
                name: register.name,
                lastName: register.lastName,
                role: Role.USER,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await service.createClient(register);

            expect(mockCryptoService.hash).toHaveBeenCalledWith("123456");
            expect(mockClientService.createClient).toHaveBeenCalledWith({
                cpf: register.cpf,
                name: register.name,
                lastName: register.lastName,
                password: "hashed",
                active: true,
                role: Role.USER,
            });

            expect(result.role).toBe(Role.USER);
        });

        it("throws when passwords do not match", async () => {
            await expect(
                service.createClient({ ...register, confirmPassword: "errada" })
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe("validateCredentials", () => {
        const client = {
            id: "1",
            cpf: "12345678900",
            name: "João",
            password: "hashed",
            role: Role.USER,
            active: true,
        };

        it("returns client when credentials are valid", async () => {
            mockClientService.findByCpf.mockResolvedValue(client);
            mockCryptoService.compare.mockResolvedValue(true);

            const result = await service.validateCredentials("123", "senha");

            expect(result).toBe(client);
        });

        it("throws when client is inactive", async () => {
            mockClientService.findByCpf.mockResolvedValue({
                ...client,
                active: false,
            });

            await expect(
                service.validateCredentials("123", "senha")
            ).rejects.toThrow(UnauthorizedException);
        });

        it("throws when password is invalid", async () => {
            mockClientService.findByCpf.mockResolvedValue(client);
            mockCryptoService.compare.mockResolvedValue(false);

            await expect(
                service.validateCredentials("123", "senha")
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe("login", () => {
        const loginDto: LoginDto = {
            cpf: "12345678900",
            password: "123456",
        };

        const client = {
            id: "1",
            cpf: "12345678900",
            name: "João",
            password: "hashed",
            role: Role.ADMIN,
            active: true,
        };

        it("returns token and user data", async () => {
            jest.spyOn(service, "validateCredentials").mockResolvedValue(client as any);
            mockJwtService.sign.mockReturnValue("jwt-token");

            const result = await service.login(loginDto);

            expect(result.accessToken).toBe("jwt-token");
            expect(result.user).toEqual({
                id: "1",
                name: "João",
                cpf: "123.***.***-00",
                role: Role.ADMIN,
                active: true,
            });
        });
    });

    describe("me", () => {
        it("maps jwt payload correctly", () => {
            const result = service.me({
                sub: "1",
                cpf: "123",
                name: "João",
                role: Role.ADMIN,
                active: true,
            });

            expect(result).toEqual({
                id: "1",
                cpf: "123",
                name: "João",
                role: Role.ADMIN,
                active: true,
            });
        });
    });
});
