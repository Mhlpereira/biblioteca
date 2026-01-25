import { ConfigService } from "@nestjs/config";
import { Role } from "../enum/role.enum";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
    let configService: Partial<ConfigService>;

    describe("constructor", () => {
        it("should throw error if JWT_SECRET is not defined", () => {
            configService = {
                get: jest.fn().mockReturnValue(undefined),
            };

            expect(() => {
                new JwtStrategy(configService as ConfigService);
            }).toThrow("JWT_SECRET is not defined");
        });

        it("should be instantiated when JWT_SECRET exists", () => {
            configService = {
                get: jest.fn().mockReturnValue("super-secret"),
            };

            const strategy = new JwtStrategy(configService as ConfigService);

            expect(strategy).toBeDefined();
            expect(configService.get).toHaveBeenCalledWith("JWT_SECRET");
        });
    });

    describe("validate", () => {
        it("should map JwtPayload to AuthUser correctly", async () => {
            configService = {
                get: jest.fn().mockReturnValue("super-secret"),
            };

            const strategy = new JwtStrategy(configService as ConfigService);

            const payload = {
                sub: "user-id-1",
                cpf: "12345678900",
                name: "Mário",
                role: Role.ADMIN,
                active: true,
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                sub: "user-id-1",
                cpf: "12345678900",
                name: "Mário",
                role: Role.ADMIN,
                active: true,
            });
            expect(result).toHaveProperty("sub");
            expect(result).toHaveProperty("role");
            expect(result.active).toBe(true);
        });
    });
});
