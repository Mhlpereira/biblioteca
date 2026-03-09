import { Test, TestingModule } from "@nestjs/testing";
import { ReservationController } from "../reservation.controller";
import { CreateReservationDto } from "../dto/request/create-reservation.dto";
import { UpdateReservationDto } from "../dto/request/update-reservation.dto";
import { FindReservationDto } from "../dto/query/find-reservation.dto";
import { ReservationStatus } from "../enum/reservation-status.enum";
import { AuthUser } from "../../auth/types/auth-user.types";
import { Role } from "../../auth/enum/role.enum";

describe("ReservationController", () => {
    let controller: ReservationController;
    let service: ReservationService;

    const mockReservationService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findAuthClientReservation: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReservationController],
            providers: [
                {
                    provide: ReservationService,
                    useValue: mockReservationService,
                },
            ],
        }).compile();

        controller = module.get<ReservationController>(ReservationController);
        service = module.get<ReservationService>(ReservationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("create", () => {
        it("should create a reservation", async () => {
            const dto: CreateReservationDto = {
                bookId: "book-1",
                keycloackClientId: "client-1",
            };

            const expected = { id: "res-1" };

            mockReservationService.create.mockResolvedValue(expected);

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });
    });


    describe("findAll", () => {
        it("should return paginated reservations", async () => {
            const dto: FindReservationDto = {
                page: 1,
                limit: 10,
            };

            const expected = {
                data: [],
                meta: { total: 0, page: 1, lastPage: 1 },
            };

            mockReservationService.findAll.mockResolvedValue(expected);

            const result = await controller.findAll(dto);

            expect(service.findAll).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });
    });

    describe("findOne", () => {
        it("should return a reservation by id", async () => {
            mockReservationService.findOne.mockResolvedValue({ id: "res-1" });

            const result = await controller.findOne("res-1");

            expect(service.findOne).toHaveBeenCalledWith("res-1");
            expect(result).toEqual({ id: "res-1" });
        });
    });

    describe("findAuthClientReservations", () => {
        it("should return reservations for authenticated client", async () => {
            const user: AuthUser = {
                keycloakId: "client-1",
                email: "test@example.com",
                cpf: "12345678900",
                name: "Test",
                lastName: "User",
                role: Role.USER,
                active: true,
            };

            const expected = {
                data: [{ id: "res-1" }],
                meta: { total: 1, page: 1, lastPage: 1 },
            };

            mockReservationService.findAuthClientReservation.mockResolvedValue(expected);

            const result = await controller.findAuthClientReservations(user);

            expect(service.findAuthClientReservation).toHaveBeenCalledWith("client-1");
            expect(result).toEqual(expected);
        });
    });

    describe("update", () => {
        it("should update reservation", async () => {
            const dto: UpdateReservationDto = {
                status: ReservationStatus.ACTIVE,
            };

            mockReservationService.update.mockResolvedValue({ id: "res-1" });

            const result = await controller.update("res-1", dto);

            expect(service.update).toHaveBeenCalledWith("res-1", dto);
            expect(result).toEqual({ id: "res-1" });
        });
    });


    describe("remove", () => {
        it("should remove reservation", async () => {
            mockReservationService.remove.mockResolvedValue(undefined);

            await controller.remove({ id: "res-1" } as any);

            expect(service.remove).toHaveBeenCalledWith("res-1");
        });
    });
});
