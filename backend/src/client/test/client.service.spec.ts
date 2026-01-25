import { Test, TestingModule } from "@nestjs/testing";
import { ClientService } from "../client.service";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Client } from "../entities/client.entity";
import { CryptoService } from "../../common/crypto/crypto.service";
import { ReservationService } from "../../reservation/reservation.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Role } from "../../auth/enum/role.enum";

describe("ClientService", () => {
    let service: ClientService;
    let repo: Repository<Client>;
    let cryptoService: CryptoService;
    let reservationService: ReservationService;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOneBy: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockCryptoService = {
        compare: jest.fn(),
        hash: jest.fn(),
    };

    const mockReservationService = {
        findAuthClientReservation: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientService,
                {
                    provide: getRepositoryToken(Client),
                    useValue: mockRepository,
                },
                {
                    provide: CryptoService,
                    useValue: mockCryptoService,
                },
                {
                    provide: ReservationService,
                    useValue: mockReservationService,
                },
            ],
        }).compile();

        service = module.get(ClientService);
        repo = module.get(getRepositoryToken(Client));
        cryptoService = module.get(CryptoService);
        reservationService = module.get(ReservationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createClient", () => {
        it("should create a client successfully", async () => {
            mockRepository.findOneBy.mockResolvedValue(null);
            mockRepository.create.mockReturnValue({ cpf: "12345678909" });
            mockRepository.save.mockResolvedValue({ id: "1" });

            const result = await service.createClient({
                cpf: "12345678909",
                name: "Mário",
                lastName: "Henrique",
                password: "123",
                active: true,
                role: Role.ADMIN
            });

            expect(repo.save).toHaveBeenCalled();
            expect(result).toHaveProperty("id");
        });

        it("should throw if CPF is invalid", async () => {
            await expect(
                service.createClient({
                    cpf: "111",
                    name: "Teste",
                    lastName: "Teste",
                    password: "123",
                    active: true,
                    role: Role.ADMIN
                })
            ).rejects.toThrow(BadRequestException);
        });

        it("should throw if CPF already exists", async () => {
            mockRepository.findOneBy.mockResolvedValue({ id: "1" });

            await expect(
                service.createClient({
                    cpf: "12345678909",
                    name: "Teste",
                    lastName: "Teste",
                    password: "123",
                    active: true,
                    role: Role.ADMIN
                })
            ).rejects.toThrow("CPF já cadastrado");
        });
    });

    describe("findByIdorThrow", () => {
        it("should return client", async () => {
            mockRepository.findOneBy.mockResolvedValue({ id: "1" });

            const result = await service.findByIdorThrow("1");

            expect(result).toEqual({ id: "1" });
        });

        it("should throw if not found", async () => {
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findByIdorThrow("1")).rejects.toThrow(
                NotFoundException
            );
        });
    });


    describe("update", () => {
        it("should update client data", async () => {
            const client = { id: "1", name: "Old" };

            jest.spyOn(service, "findByIdorThrow").mockResolvedValue(client as any);
            mockRepository.save.mockResolvedValue({ ...client, name: "New" });

            const result = await service.update("1", { name: "New" });

            expect(result.name).toBe("New");
        });
    });


    describe("changePassword", () => {
        it("should change password successfully", async () => {
            const client = { id: "1", password: "hashed" };

            jest.spyOn(service, "findByIdorThrow").mockResolvedValue(client as any);
            mockCryptoService.compare.mockResolvedValue(true);
            mockCryptoService.hash.mockResolvedValue("newHash");

            const result = await service.changePassword("1", {
                currentPassword: "old",
                newPassword: "new",
                confirmPassword: "new",
            });

            expect(result.message).toBeDefined();
            expect(repo.save).toHaveBeenCalled();
        });

        it("should throw if passwords do not match", async () => {
            await expect(
                service.changePassword("1", {
                    currentPassword: "old",
                    newPassword: "a",
                    confirmPassword: "b",
                })
            ).rejects.toThrow("As senhas não conferem");
        });

        it("should throw if current password is invalid", async () => {
            jest.spyOn(service, "findByIdorThrow").mockResolvedValue({
                password: "hashed",
            } as any);

            mockCryptoService.compare.mockResolvedValue(false);

            await expect(
                service.changePassword("1", {
                    currentPassword: "wrong",
                    newPassword: "new",
                    confirmPassword: "new",
                })
            ).rejects.toThrow("Senha atual inválida");
        });
    });


    describe("deleteClient", () => {
        it("should deactivate client and remove reservations", async () => {
            const client = { id: "1", active: true };

            jest.spyOn(service, "findByIdorThrow").mockResolvedValue(client as any);

            mockReservationService.findAuthClientReservation.mockResolvedValue({
                data: [{ id: "r1" }, { id: "r2" }],
            });

            await service.deleteClient("1");

            expect(reservationService.remove).toHaveBeenCalledTimes(2);
            expect(client.active).toBe(false);
        });
    });
});
