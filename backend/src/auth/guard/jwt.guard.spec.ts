import { ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt.guard";

describe("JwtAuthGuard", () => {
    let guard: JwtAuthGuard;

    const createContext = (): ExecutionContext =>
    ({
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({}),
            getResponse: jest.fn().mockReturnValue({}),
        }),
    } as unknown as ExecutionContext);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtAuthGuard],
        }).compile();

        guard = module.get(JwtAuthGuard);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    it("calls super.canActivate when route is not public", () => {
        const superSpy = jest
            .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), "canActivate")
            .mockReturnValue(true);

        const result = guard.canActivate(createContext());

        expect(superSpy).toHaveBeenCalled();
        expect(result).toBe(true);
    });
});
