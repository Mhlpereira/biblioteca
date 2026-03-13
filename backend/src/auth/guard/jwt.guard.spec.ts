import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt.guard";
import { Role } from "../enum/role.enum";
import { PERMIT_ALL_KEY } from "../decorators/public.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";

describe("JwtAuthGuard", () => {
    let guard: JwtAuthGuard;
    let reflector: jest.Mocked<Reflector>;

    const buildUserinfo = (payload: Record<string, unknown>): string =>
        Buffer.from(JSON.stringify(payload)).toString("base64");

    const buildJwtToken = (payload: Record<string, unknown>): string => {
        const header = buildUserinfo({ alg: "none", typ: "JWT" });
        const body = buildUserinfo(payload);
        return `${header}.${body}.signature`;
    };

    const adminPayload = {
        sub: "user-123",
        email: "admin@test.com",
        given_name: "Admin",
        family_name: "User",
        preferred_username: "12345678900",
        realm_access: { roles: ["ADMIN"] },
    };

    const userPayload = {
        sub: "user-456",
        email: "user@test.com",
        given_name: "Normal",
        family_name: "User",
        preferred_username: "98765432100",
        realm_access: { roles: ["USER"] },
    };

    const createContext = (headers: Record<string, string> = {}): ExecutionContext => {
        const request = {
            url: "/test",
            get: jest.fn((key: string) => headers[key] ?? headers[key.toLowerCase()]),
            user: undefined,
        };
        return {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue(request),
            }),
        } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: Reflector,
                    useValue: { getAllAndOverride: jest.fn() },
                },
            ],
        }).compile();

        guard = module.get(JwtAuthGuard);
        reflector = module.get(Reflector);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    it("should return true when route is public", () => {
        reflector.getAllAndOverride.mockReturnValueOnce(true);

        const result = guard.canActivate(createContext());

        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERMIT_ALL_KEY, expect.any(Array));
        expect(result).toBe(true);
    });

    it("should throw UnauthorizedException when Authorization header is missing", () => {
        reflector.getAllAndOverride.mockReturnValueOnce(false);

        expect(() => guard.canActivate(createContext())).toThrow(UnauthorizedException);
    });

    it("should set request.user with ADMIN role", () => {
        reflector.getAllAndOverride
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(undefined);

        const ctx = createContext({ Authorization: `Bearer ${buildJwtToken(adminPayload)}` });
        const result = guard.canActivate(ctx);
        const request = ctx.switchToHttp().getRequest();

        expect(result).toBe(true);
        expect(request.user).toEqual({
            keycloakId: "user-123",
            email: "admin@test.com",
            name: "Admin",
            lastName: "User",
            cpf: "12345678900",
            role: Role.ADMIN,
            active: true,
        });
    });

    it("should set request.user with USER role when not ADMIN", () => {
        reflector.getAllAndOverride
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(undefined);

        const ctx = createContext({ Authorization: `Bearer ${buildJwtToken(userPayload)}` });
        guard.canActivate(ctx);
        const request = ctx.switchToHttp().getRequest();

        expect(request.user.role).toBe(Role.USER);
    });

    it("should return true when no required roles are set", () => {
        reflector.getAllAndOverride
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(undefined);

        const result = guard.canActivate(
            createContext({ Authorization: `Bearer ${buildJwtToken(adminPayload)}` }),
        );

        expect(result).toBe(true);
    });

    it("should return true when required roles is empty array", () => {
        reflector.getAllAndOverride
            .mockReturnValueOnce(false)
            .mockReturnValueOnce([]);

        const result = guard.canActivate(
            createContext({ Authorization: `Bearer ${buildJwtToken(adminPayload)}` }),
        );

        expect(result).toBe(true);
    });

    it("should return true when user has required role", () => {
        reflector.getAllAndOverride
            .mockReturnValueOnce(false)
            .mockReturnValueOnce([Role.ADMIN]);

        const result = guard.canActivate(
            createContext({ Authorization: `Bearer ${buildJwtToken(adminPayload)}` }),
        );

        expect(result).toBe(true);
    });

    it("should throw UnauthorizedException when user lacks required role", () => {
        reflector.getAllAndOverride
            .mockReturnValueOnce(false)
            .mockReturnValueOnce([Role.ADMIN]);

        expect(() =>
            guard.canActivate(
                createContext({ Authorization: `Bearer ${buildJwtToken(userPayload)}` }),
            ),
        ).toThrow(UnauthorizedException);
    });

    it("should use name when given_name is absent", () => {
        const payload = { sub: "user-789", name: "Full Name", realm_access: { roles: [] } };

        reflector.getAllAndOverride
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(undefined);

        const ctx = createContext({ Authorization: `Bearer ${buildJwtToken(payload)}` });
        guard.canActivate(ctx);
        const request = ctx.switchToHttp().getRequest();

        expect(request.user.name).toBe("Full Name");
        expect(request.user.email).toBe("");
        expect(request.user.lastName).toBe("");
        expect(request.user.cpf).toBe("");
    });

    it("should default to USER role when realm_access is undefined", () => {
        const payload = { sub: "user-000" };

        reflector.getAllAndOverride
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(undefined);

        const ctx = createContext({ Authorization: `Bearer ${buildJwtToken(payload)}` });
        guard.canActivate(ctx);
        const request = ctx.switchToHttp().getRequest();

        expect(request.user.role).toBe(Role.USER);
    });

    it("should log X-Userinfo header as present when both headers are set", () => {
        reflector.getAllAndOverride
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(undefined);

        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        const ctx = createContext({
            Authorization: `Bearer ${buildJwtToken(adminPayload)}`,
            "X-Userinfo": "some-encoded-userinfo",
        });

        const result = guard.canActivate(ctx);

        expect(result).toBe(true);
        consoleLogSpy.mockRestore();
    });
});

