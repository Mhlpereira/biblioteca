import { INestApplication, ExecutionContext, HttpStatus } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import  request from "supertest";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Role } from "../../auth/enum/role.enum";
import { CryptoService } from "../../common/crypto/crypto.service";
import { ReservationService } from "../../reservation/reservation.service";
import { ClientController } from "../client.controller";
import { ClientService } from "../client.service";
import { Client } from "../entities/client.entity";




class FakeAuthGuard {
    constructor(private readonly user: any) {}

    canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        req.user = this.user;
        return true;
    }
}

describe("ClientController (e2e / integration)", () => {
    let app: INestApplication;
    let dataSource: DataSource;

    let clientRepo: Repository<Client>;
    let reservationService: jest.Mocked<ReservationService>;
    let cryptoService: jest.Mocked<CryptoService>;

    const userJwt = { sub: "USER_01", role: Role.USER };
    const adminJwt = { sub: "ADMIN_01", role: Role.ADMIN };

    beforeAll(async () => {
        const reservationServiceMock: Partial<jest.Mocked<ReservationService>> = {
            findAuthClientReservation: jest.fn().mockResolvedValue({
                data: [],
                meta: { total: 0, page: 1, lastPage: 1 },
            } as any),
            remove: jest.fn().mockResolvedValue(undefined as any),
        };

        const cryptoServiceMock: Partial<jest.Mocked<CryptoService>> = {
            hash: jest.fn().mockImplementation((password: string) => Promise.resolve(`hashed_${password}`)),
            compare: jest.fn().mockImplementation((plain: string, hashed: string) => Promise.resolve(hashed === `hashed_${plain}`)),
        };

        const moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: "sqlite",
                    database: ":memory:",
                    dropSchema: true,
                    entities: [Client],
                    synchronize: true,
                    namingStrategy: new SnakeNamingStrategy(),
                    logging: false,
                }),
                TypeOrmModule.forFeature([Client]),
            ],
            controllers: [ClientController],
            providers: [
                ClientService,
                { provide: CryptoService, useValue: cryptoServiceMock },
                { provide: ReservationService, useValue: reservationServiceMock },
            ],
        }).compile();

        app = moduleRef.createNestApplication();


        app.useGlobalGuards(new FakeAuthGuard(userJwt) as any);

        await app.init();

        dataSource = app.get(DataSource);
        clientRepo = dataSource.getRepository(Client);
        reservationService = app.get(ReservationService);
        cryptoService = app.get(CryptoService);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clientRepo.delete({});
        jest.clearAllMocks();
    });

    async function seedClient(params?: Partial<Client>) {
        const passwordHash = await cryptoService.hash("Senha@123");
        const client = clientRepo.create({
            id: userJwt.sub,
            cpf: "12345678909",
            name: "Mario",
            lastName: "Henrique",
            password: passwordHash,
            active: true,
            role: Role.USER,
            ...params,
        });
        return clientRepo.save(client);
    }

    describe("PATCH /clients/me", () => {
        it("should update authenticated client profile", async () => {
            await seedClient();

            const res = await request(app.getHttpServer())
                .patch("/clients/me")
                .send({ name: "NovoNome", lastName: "NovoSobrenome" })
                .expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                id: userJwt.sub,
                name: "NovoNome",
                lastName: "NovoSobrenome",
            });

            const updated = await clientRepo.findOneBy({ id: userJwt.sub });
            expect(updated?.name).toBe("NovoNome");
            expect(updated?.lastName).toBe("NovoSobrenome");
        });
    });

    describe("PATCH /clients/me/password", () => {
        it("should change password (204 or 200 depending on your impl)", async () => {
            await seedClient();

            const res = await request(app.getHttpServer()).patch("/clients/me/password").send({
                currentPassword: "Senha@123",
                newPassword: "NovaSenha@123",
                confirmPassword: "NovaSenha@123",
            });

            expect([HttpStatus.NO_CONTENT, HttpStatus.OK]).toContain(res.status);

            const updated = await clientRepo.findOneBy({ id: userJwt.sub });
            expect(updated).toBeTruthy();

            const ok = await cryptoService.compare("NovaSenha@123", updated!.password);
            expect(ok).toBe(true);
        });

        it("should return 400 when current password is invalid", async () => {
            await seedClient();

            await request(app.getHttpServer())
                .patch("/clients/me/password")
                .send({
                    currentPassword: "Errada@123",
                    newPassword: "NovaSenha@123",
                    confirmPassword: "NovaSenha@123",
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it("should return 400 when confirmPassword mismatch", async () => {
            await seedClient();

            await request(app.getHttpServer())
                .patch("/clients/me/password")
                .send({
                    currentPassword: "Senha@123",
                    newPassword: "NovaSenha@123",
                    confirmPassword: "Diferente@123",
                })
                .expect(HttpStatus.BAD_REQUEST);
        });
    });

    describe("DELETE /clients/me", () => {
        it("should deactivate client and remove reservations if any", async () => {
            await seedClient();

            reservationService.findAuthClientReservation.mockResolvedValueOnce({
                data: [{ id: "RES_1" }, { id: "RES_2" }] as any,
                meta: { total: 2, page: 1, lastPage: 1 },
            } as any);

            const res = await request(app.getHttpServer()).delete("/clients/me");

            expect(res.status).toBe(HttpStatus.NO_CONTENT);

            const client = await clientRepo.findOneBy({ id: userJwt.sub });
            expect(client?.active).toBe(false);

            expect(reservationService.findAuthClientReservation).toHaveBeenCalledWith(userJwt.sub);
            expect(reservationService.remove).toHaveBeenCalledTimes(2);
            expect(reservationService.remove).toHaveBeenCalledWith("RES_1");
            expect(reservationService.remove).toHaveBeenCalledWith("RES_2");
        });
    });

    describe("GET /clients/:id", () => {
        it("should return client by id", async () => {
            await seedClient({ id: "C1" });

            const res = await request(app.getHttpServer()).get("/clients/C1").expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                id: "C1",
                cpf: "12345678909",
                name: "Mario",
                lastName: "Henrique",
            });
        });

        it("should return 404 when client not found", async () => {
            await request(app.getHttpServer()).get("/clients/NOT_FOUND").expect(HttpStatus.NOT_FOUND);
        });
    });

    describe("GET /clients (admin-only)", () => {
        beforeAll(async () => {
            app.useGlobalGuards(new FakeAuthGuard(adminJwt) as any);
        });

        it("should list clients paginated", async () => {
            await clientRepo.save([
                clientRepo.create({
                    id: "U1",
                    cpf: "11111111111",
                    name: "Ana",
                    lastName: "Silva",
                    password: await cryptoService.hash("Senha@123"),
                    active: true,
                    role: Role.USER,
                }),
                clientRepo.create({
                    id: "U2",
                    cpf: "22222222222",
                    name: "Bruno",
                    lastName: "Souza",
                    password: await cryptoService.hash("Senha@123"),
                    active: false,
                    role: Role.USER,
                }),
            ]);

            const res = await request(app.getHttpServer()).get("/clients?page=1&limit=10").expect(HttpStatus.OK);

            expect(res.body).toHaveProperty("data");
            expect(res.body).toHaveProperty("meta");
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
