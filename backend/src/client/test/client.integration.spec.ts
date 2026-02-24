import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { NotFoundException } from "@nestjs/common";

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
    });

    afterAll(async () => {
        await module.close();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await repo.clear();
    });

    it("update: should persist changes", async () => {
        const saved = await service.createClientFromKeycloak({
            keycloakId: "kc-1",
            email: "old@example.com",
            name: "Old",
            lastName: "Name",
            active: true,
            role: Role.USER,
        });

        const updated = await service.update(saved.id, { name: "New", lastName: "Last" });

        expect(updated.id).toBe(saved.id);

        const found = await repo.findOneBy({ id: saved.id });
        expect(found?.name).toBe("New");
        expect(found?.lastName).toBe("Last");
    });

    it("findByIdorThrow: should throw when not found", async () => {
        await expect(service.findByIdorThrow("NOPE")).rejects.toBeInstanceOf(NotFoundException);
    });

    it("deleteClient: should set active=false and save (expects service to persist)", async () => {
        const client = await service.createClientFromKeycloak({
            keycloakId: "kc-2",
            email: "mario@example.com",
            name: "Mario",
            lastName: "Henrique",
            active: true,
            role: Role.USER,
        });

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
