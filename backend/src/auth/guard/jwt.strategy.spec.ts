import { ConfigService } from "@nestjs/config";
import { Role } from "../enum/role.enum";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
    let configService: Partial<ConfigService>;

    describe("constructor", () => {
        it("should throw error if KEYCLOAK_ISSUER or KEYCLOAK_JWKS_URI is not defined", () => {
            configService = {
                get: jest.fn().mockReturnValue(undefined),
            };

            expect(() => {
                new JwtStrategy(configService as ConfigService);
            }).toThrow("KEYCLOAK_ISSUER ou KEYCLOAK_JWKS_URI não definido");
        });

        it("should be instantiated when Keycloak config exists", () => {
            configService = {
                get: jest.fn().mockImplementation((key: string) => {
                    const values: Record<string, string> = {
                        KEYCLOAK_ISSUER: "https://keycloak.example.com/realms/myrealm",
                        KEYCLOAK_JWKS_URI: "https://keycloak.example.com/realms/myrealm/protocol/openid-connect/certs",
                        KEYCLOAK_CLIENT_ID: "my-client",
                    };
                    return values[key];
                }),
            };

            const strategy = new JwtStrategy(configService as ConfigService);

            expect(strategy).toBeDefined();
            expect(configService.get).toHaveBeenCalledWith("KEYCLOAK_ISSUER");
            expect(configService.get).toHaveBeenCalledWith("KEYCLOAK_JWKS_URI");
        });
    });

    describe("validate", () => {
        it("should map JWT payload to AuthUser with USER role", async () => {
            configService = {
                get: jest.fn().mockImplementation((key: string) => {
                    const values: Record<string, string> = {
                        KEYCLOAK_ISSUER: "https://keycloak.example.com/realms/myrealm",
                        KEYCLOAK_JWKS_URI: "https://keycloak.example.com/realms/myrealm/protocol/openid-connect/certs",
                        KEYCLOAK_CLIENT_ID: "my-client",
                    };
                    return values[key];
                }),
            };

            const strategy = new JwtStrategy(configService as ConfigService);

            const payload = {
                sub: "user-id-1",
                cpf: "12345678900",
                name: "Mário",
                email: "mario@example.com",
                family_name: "Henrique",
                active: true,
                realm_access: { roles: ["USER"] },
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                sub: "user-id-1",
                cpf: "12345678900",
                name: "Mário",
                email: "mario@example.com",
                lastName: "Henrique",
                role: Role.USER,
                active: true,
            });
            expect(result).toHaveProperty("sub");
            expect(result).toHaveProperty("role");
            expect(result.active).toBe(true);
        });

        it("should assign ADMIN role when ADMIN is in realm_access.roles", async () => {
            configService = {
                get: jest.fn().mockImplementation((key: string) => {
                    const values: Record<string, string> = {
                        KEYCLOAK_ISSUER: "https://keycloak.example.com/realms/myrealm",
                        KEYCLOAK_JWKS_URI: "https://keycloak.example.com/realms/myrealm/protocol/openid-connect/certs",
                    };
                    return values[key];
                }),
            };

            const strategy = new JwtStrategy(configService as ConfigService);

            const payload = {
                sub: "admin-id",
                cpf: "12345678900",
                name: "Admin",
                email: "admin@example.com",
                realm_access: { roles: ["ADMIN", "USER"] },
            };

            const result = await strategy.validate(payload);

            expect(result.role).toBe(Role.ADMIN);
        });
    });
});
