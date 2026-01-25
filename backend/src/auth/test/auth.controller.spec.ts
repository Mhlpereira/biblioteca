import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { Response } from "express";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { Role } from "../enum/role.enum";

describe("AuthController", () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        login: jest.fn(),
        me: jest.fn(),
        createClient: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("POST /register", () => {
        it("should create a client successfully", async () => {
            const registerDto: RegisterDto = {
                name: "Mário",
                lastName: "Henrique",
                cpf: "12345678900",
                password: "senha123",
                confirmPassword: "senha123",
            };

            const expectedOutput = {
                id: "1",
                name: "Mário",
                cpf: "123.***.***-00",
                role: Role.USER,
                active: true,
            };

            mockAuthService.createClient.mockResolvedValue(expectedOutput);

            const result = await controller.createClient(registerDto);

            expect(authService.createClient).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual(expectedOutput);
        });

        it("should propagate service errors", async () => {
            const registerDto: RegisterDto = {
                name: "Mário",
                lastName: "Henrique",
                cpf: "12345678900",
                password: "senha123",
                confirmPassword: "senha123",
            };

            mockAuthService.createClient.mockRejectedValue(
                new Error("Cpf já cadastrado")
            );

            await expect(controller.createClient(registerDto)).rejects.toThrow(
                "Cpf já cadastrado"
            );
        });
    });

    describe("POST /login", () => {
        let mockResponse: Partial<Response>;

        beforeEach(() => {
            mockResponse = {
                cookie: jest.fn(),
            };
        });

        it("should login, set cookie and return user data", async () => {
            const loginDto: LoginDto = {
                cpf: "12345678900",
                password: "senha123",
            };

            const loginResult = {
                accessToken: "jwt-token-abc123",
                user: {
                    id: "1",
                    name: "Mário",
                    cpf: "123.***.***-00",
                    role: Role.USER,
                    active: true,
                },
            };

            mockAuthService.login.mockResolvedValue(loginResult);

            const result = await controller.login(
                loginDto,
                mockResponse as Response
            );

            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(mockResponse.cookie).toHaveBeenCalledWith(
                "access_token",
                "jwt-token-abc123",
                expect.objectContaining({
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                    maxAge: 2 * 60 * 60 * 1000,
                })
            );

            expect(result).toEqual(loginResult.user);
        });

        it("should propagate authentication errors", async () => {
            const loginDto: LoginDto = {
                cpf: "12345678900",
                password: "senhaErrada",
            };

            mockAuthService.login.mockRejectedValue(
                new Error("Credenciais inválidas")
            );

            await expect(
                controller.login(loginDto, mockResponse as Response)
            ).rejects.toThrow("Credenciais inválidas");

            expect(mockResponse.cookie).not.toHaveBeenCalled();
        });
    });

    describe("GET /me", () => {
        it("should return current authenticated user", () => {
            const jwtPayload = {
                sub: "1",
                cpf: "12345678900",
                name: "Mário",
                role: Role.ADMIN,
                active: true,
            };

            mockAuthService.me.mockReturnValue({
                id: "1",
                cpf: jwtPayload.cpf,
                name: jwtPayload.name,
                role: jwtPayload.role,
                active: true,
            });

            const result = controller.me(jwtPayload);

            expect(authService.me).toHaveBeenCalledWith(jwtPayload);
            expect(result).toEqual({
                id: "1",
                cpf: jwtPayload.cpf,
                name: jwtPayload.name,
                role: jwtPayload.role,
                active: true,
            });
        });
    });

    describe("POST /logout", () => {
        let mockResponse: Partial<Response>;

        beforeEach(() => {
            mockResponse = {
                clearCookie: jest.fn(),
            };
        });

        it("should clear cookie and return success message", () => {
            const result = controller.logout(mockResponse as Response);

            expect(mockResponse.clearCookie).toHaveBeenCalledWith(
                "access_token",
                expect.objectContaining({
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                })
            );

            expect(result).toEqual({
                message: "Logout realizado com sucesso",
            });
        });
    });
});
