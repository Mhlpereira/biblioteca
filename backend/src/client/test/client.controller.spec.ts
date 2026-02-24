import { Test, TestingModule } from "@nestjs/testing";
import { ClientController } from "../client.controller";
import { ClientService } from "../client.service";
import { UpdateClientDto } from "../dto/update-client.dto";
import { JwtPayload } from "../../auth/types/jwt-payload.types";
import { FindClientDto } from "../dto/find-client.dto";

describe("ClientController", () => {
    let controller: ClientController;
    let service: ClientService;

    const mockClientService = {
        findByIdorThrow: jest.fn(),
        update: jest.fn(),
        deleteClient: jest.fn(),
        findAll: jest.fn(),
    };

    const mockUser: JwtPayload = {
        sub: "user-id-1",
        keycloakSub: "user-id-1",
        cpf: "12345678900",
        name: "Mário",
        lastName: "Henrique",
        email: "mario@example.com",
        active: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClientController],
            providers: [
                {
                    provide: ClientService,
                    useValue: mockClientService,
                },
            ],
        }).compile();

        controller = module.get<ClientController>(ClientController);
        service = module.get<ClientService>(ClientService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("getById", () => {
        it("should return a client by id", async () => {
            const client = { id: "1", name: "João" };

            mockClientService.findByIdorThrow.mockResolvedValue(client);

            const result = await controller.getById("1");

            expect(service.findByIdorThrow).toHaveBeenCalledWith("1");
            expect(result).toEqual(client);
        });

        it("should propagate errors", async () => {
            mockClientService.findByIdorThrow.mockRejectedValue(
                new Error("Client not found")
            );

            await expect(controller.getById("1")).rejects.toThrow(
                "Client not found"
            );
        });
    });

    describe("update", () => {
        it("should update authenticated client", async () => {
            const dto: UpdateClientDto = {
                name: "Novo Nome",
            };

            const updatedClient = { id: mockUser.sub, name: "Novo Nome" };

            mockClientService.update.mockResolvedValue(updatedClient);

            const result = await controller.update(mockUser, dto);

            expect(service.update).toHaveBeenCalledWith(mockUser.sub, dto);
            expect(result).toEqual(updatedClient);
        });
    });

    describe("remove", () => {
        it("should delete authenticated client", async () => {
            mockClientService.deleteClient.mockResolvedValue(undefined);

            const result = await controller.remove(mockUser);

            expect(service.deleteClient).toHaveBeenCalledWith(mockUser.sub);
            expect(result).toBeUndefined();
        });
    });

    describe("findAll", () => {
        it("should return list of clients", async () => {
            const dto: FindClientDto = {
                name: "João",
            };

            const clients = [
                { id: "1", name: "João" },
                { id: "2", name: "João Silva" },
            ];

            mockClientService.findAll.mockResolvedValue(clients);

            const result = await controller.findAll(dto);

            expect(service.findAll).toHaveBeenCalledWith(dto);
            expect(result).toEqual(clients);
        });
    });
});