import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";

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

    it("should login and set cookie", async () => {
        const res = {
            cookie: jest.fn(),
        } as any;

        mockAuthService.login.mockResolvedValue({
            accessToken: "jwt-token",
        });

        await controller.login({ cpf: "123", password: "123" } as any, res);

        expect(authService.login).toHaveBeenCalled();
        expect(res.cookie).toHaveBeenCalledWith(
            "access_token",
            "jwt-token",
            expect.objectContaining({
                httpOnly: true,
                secure: true,
            })
        );
    });

    it("should return current user", () => {
        const user = { userId: "1", name: "João" };

        mockAuthService.me.mockReturnValue(user);

        const result = controller.me(user as any);

        expect(result).toEqual(user);
    });
});
