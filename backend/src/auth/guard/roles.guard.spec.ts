import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { Role } from "../enum/role.enum";
import { DENY_ROLES_KEY } from "../decorators/roles.decorator";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: mockReflector,
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    // Helper para criar ExecutionContext mockado
    const createMockExecutionContext = (user?: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
        } as any;
    };

    describe("canActivate", () => {
        describe("when user is not authenticated", () => {
            it("should return true when user is undefined", () => {
                // Arrange
                const context = createMockExecutionContext(undefined);
                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
            });

            it("should return true when user is null", () => {
                // Arrange
                const context = createMockExecutionContext(null);
                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
            });
        });

        describe("when no roles are denied (public route)", () => {
            it("should return true when deniedRoles is undefined", () => {
                // Arrange
                const user = { id: "1", role: Role.USER };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue(undefined);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
            });

            it("should return true when deniedRoles is null", () => {
                // Arrange
                const user = { id: "1", role: Role.USER };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue(null);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
            });

            it("should return true when deniedRoles is empty array", () => {
                // Arrange
                const user = { id: "1", role: Role.USER };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
            });
        });

        describe("when user role is in denied roles", () => {
            it("should return false when user is ADMIN and ADMIN is denied", () => {
                // Arrange
                const user = { id: "1", role: Role.ADMIN };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(false);
            });

            it("should return false when user is USER and USER is denied", () => {
                // Arrange
                const user = { id: "1", role: Role.USER };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(false);
            });

            it("should return false when user role is in multiple denied roles", () => {
                // Arrange
                const user = { id: "1", role: Role.ADMIN };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.USER, Role.ADMIN]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(false);
            });
        });

        describe("when user role is NOT in denied roles", () => {
            it("should return true when user is USER and only ADMIN is denied", () => {
                // Arrange
                const user = { id: "1", role: Role.USER };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
            });

            it("should return true when user is ADMIN and only USER is denied", () => {
                // Arrange
                const user = { id: "1", role: Role.ADMIN };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
            });

            it("should return true when user role is not in denied roles list", () => {
                // Arrange
                const user = { id: "1", role: Role.USER };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
            });
        });

        describe("reflector integration", () => {
            it("should call reflector.getAllAndOverride with correct parameters", () => {
                // Arrange
                const user = { id: "1", role: Role.USER };
                const context = createMockExecutionContext(user);
                const mockHandler = context.getHandler();
                const mockClass = context.getClass();

                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

                // Act
                guard.canActivate(context);

                // Assert
                expect(reflector.getAllAndOverride).toHaveBeenCalledWith(DENY_ROLES_KEY, [mockHandler, mockClass]);
                expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
            });

            it("should get roles from handler and class metadata", () => {
                // Arrange
                const user = { id: "1", role: Role.USER };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

                // Act
                guard.canActivate(context);

                // Assert
                expect(context.getHandler).toHaveBeenCalled();
                expect(context.getClass).toHaveBeenCalled();
            });
        });

        describe("request user extraction", () => {
            it("should extract user from request object", () => {
                // Arrange
                const user = { id: "1", role: Role.USER, name: "John Doe" };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
                expect(context.switchToHttp).toHaveBeenCalled();
            });

            it("should handle request with additional user properties", () => {
                // Arrange
                const user = {
                    id: "1",
                    role: Role.ADMIN,
                    email: "admin@test.com",
                    permissions: ["read", "write"],
                };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true);
            });
        });

        describe("edge cases", () => {
            it("should handle user without role property", () => {
                // Arrange
                const user = { id: "1" }; // Sem role
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true); // undefined não está no array
            });

            it("should handle single denied role", () => {
                // Arrange
                const user = { id: "1", role: Role.USER };
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.USER]);

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(false);
            });

            it("should be case-sensitive with role comparison", () => {
                // Arrange
                const user = { id: "1", role: "admin" }; // lowercase
                const context = createMockExecutionContext(user);
                mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]); // ADMIN

                // Act
                const result = guard.canActivate(context);

                // Assert
                expect(result).toBe(true); // Não são iguais
            });
        });
    });
});
