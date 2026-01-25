import { ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt.guard";

describe("JwtAuthGuard", () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;

    const reflectorMock = {
        getAllAndOverride: jest.fn(),
    };

    const createContext = (): ExecutionContext =>
        ({
            getHandler: jest.fn(),
            getClass: jest.fn(),
        } as any);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: Reflector,
                    useValue: reflectorMock,
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

    it("returns true when route is public", () => {
        reflectorMock.getAllAndOverride.mockReturnValue(true);

        const result = guard.canActivate(createContext());

        expect(result).toBe(true);
    });

    it("calls AuthGuard when route is not public", () => {
        reflectorMock.getAllAndOverride.mockReturnValue(false);

        const superSpy = jest
            .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), "canActivate")
            .mockReturnValue(true);

        const result = guard.canActivate(createContext());

        expect(superSpy).toHaveBeenCalled();
        expect(result).toBe(true);
    });
});
