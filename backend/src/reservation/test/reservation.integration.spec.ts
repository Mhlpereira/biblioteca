import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { ReservationController } from "../reservation.controller";
import { CreateFullReservationUseCase } from "../usecase/create-full-reservation.usecase";
import { CreateReservationUseCase } from "../usecase/create-reservation.usecase";
import { FindAllReservationsUseCase } from "../usecase/find-all-reservations.usecase";
import { FindByUserIdReservationUseCase } from "../usecase/find-by-user-id-reservation.usecase";
import { RemoveReservationUseCase } from "../usecase/remove-reservation.usecase";
import { UpdateReservationUseCase } from "../usecase/update-reservation.usecase";
import { FindByIdReservationUseCase } from "../usecase/find-by-id-reservation.usecase";
import { ReturnBookUseCase } from "../usecase/return-book.usecase";
import { JwtAuthGuard } from "../../auth/guard/jwt.guard";
import { ReservationStatus } from "../enum/reservation-status.enum";

const authUser = {
    keycloakId: "user-123",
};

const base64 = (value: object): string => Buffer.from(JSON.stringify(value)).toString("base64");

const validJwt = [
    base64({ alg: "none", typ: "JWT" }),
    base64({
        sub: authUser.keycloakId,
        email: "user@test.com",
        given_name: "Mario",
        family_name: "Silva",
        preferred_username: "00000000000",
        realm_access: { roles: ["USER"] },
    }),
    "signature",
].join(".");

describe("ReservationController Integration", () => {
    let app: INestApplication<App>;

    const createFullReservation = { execute: jest.fn() };
    const createReservation = { execute: jest.fn() };
    const findAllReservations = { execute: jest.fn() };
    const findByUserIdReservation = { execute: jest.fn() };
    const removeReservation = { execute: jest.fn() };
    const updateReservation = { execute: jest.fn() };
    const findByIdReservation = { execute: jest.fn() };
    const returnBookUseCase = { execute: jest.fn() };

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [ReservationController],
            providers: [
                { provide: CreateFullReservationUseCase, useValue: createFullReservation },
                { provide: CreateReservationUseCase, useValue: createReservation },
                { provide: FindAllReservationsUseCase, useValue: findAllReservations },
                { provide: FindByUserIdReservationUseCase, useValue: findByUserIdReservation },
                { provide: RemoveReservationUseCase, useValue: removeReservation },
                { provide: UpdateReservationUseCase, useValue: updateReservation },
                { provide: FindByIdReservationUseCase, useValue: findByIdReservation },
                { provide: ReturnBookUseCase, useValue: returnBookUseCase },
                JwtAuthGuard,
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await app.close();
    });

    it("GET /reservation should return paginated reservations", async () => {
        const responsePayload = {
            data: [
                {
                    id: "res-1",
                    keycloackClientId: "user-123",
                    bookCopyId: "copy-1",
                    status: ReservationStatus.ACTIVE,
                },
            ],
            meta: { total: 1, page: 1, lastPage: 1 },
        };

        findAllReservations.execute.mockResolvedValue(responsePayload);

        await request(app.getHttpServer())
            .get("/reservation")
            .query({ page: 1, limit: 10 })
            .expect(200)
            .expect(responsePayload);

        expect(findAllReservations.execute).toHaveBeenCalledWith(
            expect.objectContaining({ page: 1, limit: 10 }),
        );
    });

    it("POST /reservation should create reservation with authenticated user", async () => {
        const body = {
            bookId: "book-001",
            dueDate: "2026-03-20",
        };

        const responsePayload = {
            id: "res-1",
            keycloackClientId: "user-123",
            bookCopyId: "copy-1",
            dueDate: "2026-03-20",
            status: ReservationStatus.ACTIVE,
        };

        createReservation.execute.mockResolvedValue(responsePayload);

        await request(app.getHttpServer())
            .post("/reservation")
            .set("Authorization", `Bearer ${validJwt}`)
            .send(body)
            .expect(201)
            .expect(responsePayload);

        expect(createReservation.execute).toHaveBeenCalledWith({
            keycloackClientId: authUser.keycloakId,
            ...body,
        });
    });

    it("GET /reservation/me should return authenticated user reservations", async () => {
        const responsePayload = {
            data: [
                {
                    id: "res-2",
                    keycloackClientId: "user-123",
                    bookCopyId: "copy-2",
                    status: ReservationStatus.ACTIVE,
                },
            ],
            meta: { total: 1, page: 1, lastPage: 1 },
        };

        findByUserIdReservation.execute.mockResolvedValue(responsePayload);

        await request(app.getHttpServer())
            .get("/reservation/me")
            .set("Authorization", `Bearer ${validJwt}`)
            .query({ page: 1, limit: 5 })
            .expect(200)
            .expect(responsePayload);

        expect(findByUserIdReservation.execute).toHaveBeenCalledWith(
            authUser.keycloakId,
            expect.objectContaining({ page: 1, limit: 5 }),
        );
    });
});
