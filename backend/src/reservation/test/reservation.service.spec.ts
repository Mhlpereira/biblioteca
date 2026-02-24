import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";

import { NotFoundException, BadRequestException } from "@nestjs/common";
import { BookCopyService } from "../../book-copy/book-copy.service";
import { BookCopyStatus } from "../../book-copy/enum/book-status.enum";
import { ClientService } from "../../client/client.service";
import { Reservation } from "../entities/reservation.entity";
import { ReservationStatus } from "../enum/reservation-status.enum";
import { ReservationService } from "../reservation.service";


describe("ReservationService", () => {
  let service: ReservationService;
  let repository: Repository<Reservation>;
  let bookCopyService: BookCopyService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockClientService = {
    findByIdorThrow: jest.fn(),
  };

  const mockBookCopyService = {
    findAvailableCopyByBookId: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(async (cb) => {
      const manager = {
        save: jest.fn(),
        update: jest.fn(),
      };
      await cb(manager);
    }),
  };

  const mockKafkaClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockRepository,
        },
        {
          provide: ClientService,
          useValue: mockClientService,
        },
        {
          provide: BookCopyService,
          useValue: mockBookCopyService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: "KAFKA_SERVICE",
          useValue: mockKafkaClient,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    repository = module.get(getRepositoryToken(Reservation));
    bookCopyService = module.get(BookCopyService);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar uma reserva com sucesso", async () => {
      const client = { id: "client-id" };
      const bookCopy = { id: "copy-id" };

      mockClientService.findByIdorThrow.mockResolvedValue(client);
      mockBookCopyService.findAvailableCopyByBookId.mockResolvedValue(bookCopy);
      mockRepository.create.mockReturnValue({
        id: "res-id",
        client,
        bookCopy,
        reservedAt: new Date(),
        dueDate: new Date(),
      });

      const result = await service.create({
        clientId: "client-id",
        bookId: "book-id",
      });

      expect(result).toBeDefined();
      expect(mockBookCopyService.findAvailableCopyByBookId).toHaveBeenCalled();
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("deve retornar a reserva", async () => {
      const reservation = { id: "res-id" };
      mockRepository.findOneBy.mockResolvedValue(reservation);

      const result = await service.findOne("res-id");

      expect(result).toEqual(reservation);
    });

    it("deve lançar erro se não existir", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne("x"))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("deve atualizar a reserva", async () => {
      const reservation = {
        id: "res-id",
        status: ReservationStatus.ACTIVE,
        bookCopy: { id: "copy-id" },
      };

      mockRepository.findOneBy.mockResolvedValue(reservation);
      mockRepository.save.mockResolvedValue(reservation);

      const result = await service.update("res-id", {
        status: ReservationStatus.RETURNED,
      });

      expect(bookCopyService.updateStatus)
        .toHaveBeenCalledWith("copy-id", BookCopyStatus.AVAILABLE);

      expect(result.status).toBe(ReservationStatus.RETURNED);
    });
  });

  describe("returnBook", () => {
    it("deve devolver o livro com sucesso", async () => {
      const reservation = {
        id: "res-id",
        status: ReservationStatus.ACTIVE,
        dueDate: new Date(Date.now() - 86400000),
        bookCopy: { id: "copy-id" },
      };

      mockRepository.findOne.mockResolvedValue(reservation);
      mockRepository.save.mockResolvedValue(reservation);

      const result = await service.returnBook("res-id");

      expect(result.status).toBe(ReservationStatus.RETURNED);
      expect(bookCopyService.updateStatus)
        .toHaveBeenCalledWith("copy-id", BookCopyStatus.AVAILABLE);
    });

    it("deve falhar se já estiver devolvido", async () => {
      mockRepository.findOne.mockResolvedValue({
        status: ReservationStatus.RETURNED,
      });

      await expect(service.returnBook("x"))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe("remove", () => {
    it("deve remover a reserva", async () => {
      const reservation = { id: "res-id" };
      mockRepository.findOneBy.mockResolvedValue(reservation);

      await service.remove("res-id");

      expect(mockRepository.remove).toHaveBeenCalledWith(reservation);
    });

    it("deve falhar se não existir", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove("x"))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
