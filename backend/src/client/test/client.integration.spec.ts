import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { BadRequestException, NotFoundException } from "@nestjs/common";

import { ClientService } from "../client.service";
import { Client } from "../entities/client.entity";
import { CryptoService } from "../../common/crypto/crypto.service";
import { ReservationService } from "../../reservation/reservation.service";
import { Role } from "../../auth/enum/role.enum";

describe("ClientService (integration)", () => {
    let module: TestingModule;
    let service: ClientService;
    let dataSource: DataSource;
    let repo: Repository<Client>;
    let crypto: CryptoService;

    const cryptoServiceMock = {
        hash: jest.fn().mockImplementation((password: string) => Promise.resolve(`hashed_${password}`)),
        compare: jest
            .fn()
            .mockImplementation((plain: string, hashed: string) => Promise.resolve(hashed === `hashed_${plain}`)),
    };

    const reservationServiceMock = {
        findAuthClientReservation: jest.fn().mockResolvedValue({
            data: [],
            meta: { total: 0, page: 1, lastPage: 1 },
        }),
        remove: jest.fn().mockResolvedValue(undefined),
    };

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: "better-sqlite3",
                    database: ":memory:",
                    dropSchema: true,
                    entities: [Client],
                    synchronize: true,
                    namingStrategy: new SnakeNamingStrategy(),
                    logging: false,
                }),
                TypeOrmModule.forFeature([Client]),
            ],
            providers: [
                ClientService,
                { provide: CryptoService, useValue: cryptoServiceMock },
                { provide: ReservationService, useValue: reservationServiceMock },
            ],
        }).compile();

        service = module.get(ClientService);
        dataSource = module.get(DataSource);
        repo = dataSource.getRepository(Client);
        crypto = module.get(CryptoService);
    });

    afterAll(async () => {
        await module.close();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await repo.clear();
    });

    it("update: should persist changes", async () => {
        const saved = await repo.save(
            repo.create({
                id: "C1",
                cpf: "12345678909",
                name: "Old",
                lastName: "Name",
                password: await crypto.hash("Senha@123"),
                active: true,
                role: Role.USER,
            })
        );

        const updated = await service.update(saved.id, { name: "New", lastName: "Last" });

        expect(updated.id).toBe(saved.id);

        const found = await repo.findOneBy({ id: saved.id });
        expect(found?.name).toBe("New");
        expect(found?.lastName).toBe("Last");
    });

    it("changePassword: should persist new password when current is valid", async () => {
        const client = await repo.save(
            repo.create({
                id: "C1",
                cpf: "12345678909",
                name: "Mario",
                lastName: "Henrique",
                password: await crypto.hash("Senha@123"),
                active: true,
                role: Role.USER,
            })
        );

        await service.changePassword(client.id, {
            currentPassword: "Senha@123",
            newPassword: "NovaSenha@123",
            confirmPassword: "NovaSenha@123",
        });

        const found = await repo.findOneBy({ id: client.id });
        expect(found).toBeTruthy();

        const okOld = await crypto.compare("Senha@123", found!.password);
        expect(okOld).toBe(false);

        const okNew = await crypto.compare("NovaSenha@123", found!.password);
        expect(okNew).toBe(true);
    });

    it("changePassword: should throw when current password invalid", async () => {
        const client = await repo.save(
            repo.create({
                id: "C1",
                cpf: "12345678909",
                name: "Mario",
                lastName: "Henrique",
                password: await crypto.hash("Senha@123"),
                active: true,
                role: Role.USER,
            })
        );

        await expect(
            service.changePassword(client.id, {
                currentPassword: "Errada@123",
                newPassword: "NovaSenha@123",
                confirmPassword: "NovaSenha@123",
            })
        ).rejects.toBeInstanceOf(BadRequestException);
    }, 10000);

    it("findByIdorThrow: should throw when not found", async () => {
        await expect(service.findByIdorThrow("NOPE")).rejects.toBeInstanceOf(NotFoundException);
    });

    it("deleteClient: should set active=false and save (expects service to persist)", async () => {
        const client = await repo.save(
            repo.create({
                id: "C1",
                cpf: "12345678909",
                name: "Mario",
                lastName: "Henrique",
                password: await crypto.hash("Senha@123"),
                active: true,
                role: Role.USER,
            })
        );

        reservationServiceMock.findAuthClientReservation.mockResolvedValueOnce({
            data: [{ id: "R1" }, { id: "R2" }],
            meta: { total: 2, page: 1, lastPage: 1 },
        });

        await service.deleteClient(client.id);

        const found = await repo.findOneBy({ id: client.id });
        expect(found?.active).toBe(false);

        expect(reservationServiceMock.findAuthClientReservation).toHaveBeenCalledWith(client.id);
        expect(reservationServiceMock.remove).toHaveBeenCalledTimes(2);
        expect(reservationServiceMock.remove).toHaveBeenCalledWith("R1");
        expect(reservationServiceMock.remove).toHaveBeenCalledWith("R2");
    });
});
