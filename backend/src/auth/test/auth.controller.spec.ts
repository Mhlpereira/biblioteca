import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { Response } from "express";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";

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
                confirmPassword: "senha123"
            };

            const expectedOutput = {
                id: "1",
                name: "João Silva",
                email: "joao@email.com",
            };

            mockAuthService.createClient.mockResolvedValue(expectedOutput);

            const result = await controller.createClient(registerDto);

            expect(authService.createClient).toHaveBeenCalledWith(registerDto);
            expect(authService.createClient).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedOutput);
        });

        it("should propagate service errors", async () => {
            const registerDto: RegisterDto = {
                name: "Mário",
                lastName: "Henrique",
                cpf: "12345678900",
                password: "senha123",
                confirmPassword: "senha123"
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

        it("should login and set cookie with correct configuration", async () => {
            const loginDto: LoginDto = {
                cpf: "12345678900",
                password: "senha123",
            };

            mockAuthService.login.mockResolvedValue({
                accessToken: "jwt-token-abc123",
            });

            await controller.login(loginDto, mockResponse as Response);

            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(authService.login).toHaveBeenCalledTimes(1);
            expect(mockResponse.cookie).toHaveBeenCalledWith(
                "access_token",
                "jwt-token-abc123",
                expect.objectContaining({
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                    maxAge: 7200000, // 2 horas
                })
            );
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
            const mockUser = {
                userId: "1",
                name: "João Silva",
                email: "joao@email.com",
            };

            const mockRequest = {
                user: mockUser,
            };

            mockAuthService.me.mockReturnValue(mockUser);

            const result = controller.me(mockRequest);

            expect(authService.me).toHaveBeenCalledWith(mockUser);
            expect(authService.me).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUser);
        });

        it("should handle user data from service", () => {
            const mockUser = {
                userId: "2",
                name: "Maria Santos",
                email: "maria@email.com",
            };

            const mockRequest = { user: mockUser };

            mockAuthService.me.mockReturnValue({
                ...mockUser,
                role: "admin", // service pode adicionar dados extras
            });

            const result = controller.me(mockRequest);

            expect(result).toHaveProperty("role", "admin");
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

        it("should clear cookie even if no user is authenticated", () => {
            const result = controller.logout(mockResponse as Response);

            expect(mockResponse.clearCookie).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
});
