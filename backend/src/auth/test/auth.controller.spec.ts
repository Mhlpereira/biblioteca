import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { AuthUser } from "../types/auth-user.types";
import { Role } from "../enum/role.enum";

describe("AuthController", () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        me: jest.fn(),
        ensureClientFromToken: jest.fn(),
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

    describe("GET /me", () => {
        it("should return current authenticated user", () => {
            const authUser: AuthUser = {
                keycloakId: "kc-uuid-1",
                cpf: "12345678900",
                name: "Mário",
                lastName: "Henrique",
                email: "mario@example.com",
                active: true,
                role: Role.USER,
            };

            const expectedResult = {
                id: "1",
                cpf: authUser.cpf,
                name: authUser.name,
                lastName: authUser.lastName,
                email: authUser.email,
                active: true,
            };

            mockAuthService.me.mockReturnValue(expectedResult);

            const result = controller.me(authUser);

            expect(authService.me).toHaveBeenCalledWith(authUser);
            expect(result).toEqual(expectedResult);
        });
    });
});
