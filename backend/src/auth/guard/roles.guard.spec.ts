import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { Role } from "../enum/role.enum";
import { DENY_ROLES_KEY } from "../decorators/roles.decorator";

describe("RolesGuard", () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    const reflectorMock = {
        getAllAndOverride: jest.fn(),
    };

    const createContext = (user?: any): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
        } as any);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: reflectorMock,
                },
            ],
        }).compile();

        guard = module.get(RolesGuard);
        reflector = module.get(Reflector);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    it("returns true when user is undefined", () => {
        reflectorMock.getAllAndOverride.mockReturnValue([Role.ADMIN]);
        const result = guard.canActivate(createContext(undefined));
        expect(result).toBe(true);
    });

    it("returns true when no denied roles exist", () => {
        reflectorMock.getAllAndOverride.mockReturnValue(undefined);
        const result = guard.canActivate(createContext({ role: Role.USER }));
        expect(result).toBe(true);
    });

    it("returns false when user role is denied", () => {
        reflectorMock.getAllAndOverride.mockReturnValue([Role.ADMIN]);
        const result = guard.canActivate(createContext({ role: Role.ADMIN }));
        expect(result).toBe(false);
    });

    it("returns true when user role is not denied", () => {
        reflectorMock.getAllAndOverride.mockReturnValue([Role.ADMIN]);
        const result = guard.canActivate(createContext({ role: Role.USER }));
        expect(result).toBe(true);
    });

    it("returns true when user has no role", () => {
        reflectorMock.getAllAndOverride.mockReturnValue([Role.ADMIN]);
        const result = guard.canActivate(createContext({ id: "1" }));
        expect(result).toBe(true);
    });

    it("calls reflector with handler and class", () => {
        reflectorMock.getAllAndOverride.mockReturnValue([Role.ADMIN]);
        const context = createContext({ role: Role.USER });

        guard.canActivate(context);

        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
            DENY_ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );
    });
});
