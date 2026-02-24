import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../types/jwt-payload.types";

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
            const jwtPayload: JwtPayload = {
                sub: "kc-uuid-1",
                keycloakSub: "kc-uuid-1",
                cpf: "12345678900",
                name: "Mário",
                lastName: "Henrique",
                email: "mario@example.com",
                active: true,
            };

            const expectedResult = {
                id: "1",
                cpf: jwtPayload.cpf,
                name: jwtPayload.name,
                lastName: jwtPayload.lastName,
                email: jwtPayload.email,
                active: true,
            };

            mockAuthService.me.mockReturnValue(expectedResult);

            const result = controller.me(jwtPayload);

            expect(authService.me).toHaveBeenCalledWith(jwtPayload);
            expect(result).toEqual(expectedResult);
        });
    });
});
