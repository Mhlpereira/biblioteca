import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { ClientService } from "../../client/client.service";
import { UnauthorizedException } from "@nestjs/common";
import { Role } from "../enum/role.enum";
import { AuthUser } from "../types/auth-user.types";

describe("AuthService", () => {
    let service: AuthService;

    const mockClientService = {
        createClient: jest.fn(),
        findByKeycloakId: jest.fn(),
        createClientFromKeycloak: jest.fn(),
        updateRole: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: ClientService, useValue: mockClientService },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createClient", () => {
        it("creates client with default role and active true", async () => {
            const register = {
                cpf: "12345678900",
                name: "João",
                lastName: "Silva",
                email: "joao@example.com",
                keycloakId: "kc-uuid",
            };

            mockClientService.createClient.mockResolvedValue({
                id: "1",
                cpf: register.cpf,
                email: register.email,
                name: register.name,
                lastName: register.lastName,
                role: Role.USER,
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await service.createClient(register);

            expect(mockClientService.createClient).toHaveBeenCalledWith(
                expect.objectContaining({
                    cpf: register.cpf,
                    name: register.name,
                    lastName: register.lastName,
                    active: true,
                    role: Role.USER,
                })
            );

            expect(result.role).toBe(Role.USER);
        });
    });

    describe("ensureClientFromToken", () => {
        const authUser: AuthUser = {
            keycloakId: "kc-uuid",
            email: "joao@example.com",
            cpf: "12345678900",
            name: "João",
            lastName: "Silva",
            active: true,
            role: Role.USER,
        };

        it("creates client when not found in db", async () => {
            mockClientService.findByKeycloakId.mockResolvedValue(null);
            mockClientService.createClientFromKeycloak.mockResolvedValue({
                id: "1",
                active: true,
                role: Role.USER,
            });

            const result = await service.ensureClientFromToken(authUser);

            expect(mockClientService.createClientFromKeycloak).toHaveBeenCalled();
            expect(result).toHaveProperty("id", "1");
        });

        it("returns existing client when found", async () => {
            const existingClient = { id: "1", active: true, role: Role.USER };
            mockClientService.findByKeycloakId.mockResolvedValue(existingClient);

            const result = await service.ensureClientFromToken(authUser);

            expect(mockClientService.createClientFromKeycloak).not.toHaveBeenCalled();
            expect(result).toBe(existingClient);
        });

        it("throws when token has no keycloakId", async () => {
            await expect(
                service.ensureClientFromToken({ ...authUser, keycloakId: "" })
            ).rejects.toThrow(UnauthorizedException);
        });

        it("throws when client is inactive", async () => {
            mockClientService.findByKeycloakId.mockResolvedValue({
                id: "1",
                active: false,
                role: Role.USER,
            });

            await expect(service.ensureClientFromToken(authUser)).rejects.toThrow(
                UnauthorizedException
            );
        });
    });
});
