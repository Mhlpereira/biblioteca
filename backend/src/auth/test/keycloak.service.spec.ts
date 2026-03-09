import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConflictException } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { KeycloakService } from "../keycloack.service";
import { AxiosResponse } from "axios";

describe("KeycloakService", () => {
    let service: KeycloakService;
    let httpService: HttpService;

    const mockHttpService = {
        post: jest.fn(),
    };

    const makeAxiosResponse = <T>(data: T, extra?: Partial<AxiosResponse<T>>): AxiosResponse<T> => ({
        data,
        status: 200,
        statusText: "OK",
        headers: {},
        config: { headers: {} } as any,
        ...extra,
    });

    beforeEach(async () => {
        // Set required env vars
        process.env.KEYCLOAK_BASE_URL = "https://keycloak.example.com";
        process.env.KEYCLOAK_REALM = "biblioteca";
        process.env.KC_ADMIN_CLIENT_ID = "admin-client";
        process.env.KC_ADMIN_CLIENT_SECRET = "super-secret";

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                KeycloakService,
                {
                    provide: HttpService,
                    useValue: mockHttpService,
                },
            ],
        }).compile();

        service = module.get<KeycloakService>(KeycloakService);
        httpService = module.get<HttpService>(HttpService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createUser", () => {
        const input = {
            cpf: "52998224725",
            email: "mario@example.com",
            name: "Mário",
            lastName: "Henrique",
        };

        it("should create a user and return the Keycloak user ID", async () => {
            // Mock adminToken POST
            mockHttpService.post
                .mockReturnValueOnce(
                    of(makeAxiosResponse({ access_token: "tok-abc" }))
                )
                // Mock createUser POST — location header contains the new user URL
                .mockReturnValueOnce(
                    of(
                        makeAxiosResponse(null, {
                            status: 201,
                            headers: {
                                location:
                                    "https://keycloak.example.com/admin/realms/biblioteca/users/uuid-1234",
                            },
                        })
                    )
                );

            const userId = await service.createUser(input);

            expect(userId).toBe("uuid-1234");

            // adminToken call
            expect(mockHttpService.post).toHaveBeenNthCalledWith(
                1,
                "https://keycloak.example.com/realms/biblioteca/protocol/openid-connect/token",
                expect.stringContaining("grant_type=client_credentials"),
                expect.objectContaining({
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                })
            );

            // createUser call
            expect(mockHttpService.post).toHaveBeenNthCalledWith(
                2,
                "https://keycloak.example.com/admin/realms/biblioteca/users",
                expect.objectContaining({
                    username: input.cpf,
                    email: input.email,
                    firstName: input.name,
                    lastName: input.lastName,
                    enabled: true,
                    emailVerified: false,
                }),
                expect.objectContaining({
                    headers: { Authorization: "Bearer tok-abc" },
                })
            );
        });

        it("should throw ConflictException when Keycloak returns 409", async () => {
            const setup409 = () => {
                mockHttpService.post
                    .mockReturnValueOnce(
                        of(makeAxiosResponse({ access_token: "tok-abc" }))
                    )
                    .mockReturnValueOnce(
                        throwError(() => ({
                            response: { status: 409, data: "User exists" },
                        }))
                    );
            };

            setup409();

            let caught: unknown;
            try {
                await service.createUser(input);
            } catch (e: unknown) {
                caught = e;
            }

            expect(caught).toBeInstanceOf(ConflictException);
            expect(caught.message).toBe("CPF já cadastrado no Keycloak.");
        });

        it("should rethrow unexpected errors from createUser call", async () => {
            mockHttpService.post
                .mockReturnValueOnce(
                    of(makeAxiosResponse({ access_token: "tok-abc" }))
                )
                .mockReturnValueOnce(
                    throwError(() => new Error("Network error"))
                );

            await expect(service.createUser(input)).rejects.toThrow("Network error");
        });

        it("should include admin credentials in the token request body", async () => {
            mockHttpService.post
                .mockReturnValueOnce(
                    of(makeAxiosResponse({ access_token: "tok-xyz" }))
                )
                .mockReturnValueOnce(
                    of(
                        makeAxiosResponse(null, {
                            status: 201,
                            headers: {
                                location:
                                    "https://keycloak.example.com/admin/realms/biblioteca/users/uuid-5678",
                            },
                        })
                    )
                );

            await service.createUser(input);

            const tokenRequestBody: string = mockHttpService.post.mock.calls[0][1];
            expect(tokenRequestBody).toContain("client_id=admin-client");
            expect(tokenRequestBody).toContain("client_secret=super-secret");
            expect(tokenRequestBody).toContain("grant_type=client_credentials");
        });
    });
});
