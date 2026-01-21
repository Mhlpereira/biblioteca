import { Test, TestingModule } from "@nestjs/testing";
import { ClientService } from "../client.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Client } from "../entities/client.entity";
import { CryptoService } from "../../common/crypto/crypto.service";
import { Repository } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { ulid } from "ulid";

jest.mock("cpf-cnpj-validator", () => ({
    cpf: {
        isValid: jest.fn(),
    },
}));

jest.mock("ulid", () => ({
    ulid: jest.fn(),
}));

describe("ClientService", () => {
    let service: ClientService;
    let clientRepository: jest.Mocked<Repository<Client>>;

    beforeEach(async () => {
        clientRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
        } as any;

        (ulid as jest.MockedFunction<typeof ulid>).mockReset();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientService,
                {
                    provide: getRepositoryToken(Client),
                    useValue: clientRepository,
                },
                {
                    provide: CryptoService,
                    useValue: { hash: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<ClientService>(ClientService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createClient", () => {
        const createClientDto = {
            cpf: "12345678901",
            name: "João",
            lastName: "Silva",
            password: "password123",
        };

        it("should create a client successfully", async () => {
            const { cpf } = require("cpf-cnpj-validator");
            cpf.isValid.mockReturnValue(true);

            clientRepository.findOneBy.mockResolvedValue(null);

            const mockUlid = "01HXXXXXXXXXXXXXXXXXXXXX";
            (ulid as jest.MockedFunction<typeof ulid>).mockReturnValue(mockUlid);

            const now = new Date();
            const mockClient = {
                id: mockUlid,
                ...createClientDto,
                createdAt: now,
                updatedAt: now,
            };
            clientRepository.create.mockReturnValue(mockClient);
            clientRepository.save.mockResolvedValue(mockClient);

            const result = await service.createClient(createClientDto);

            expect(cpf.isValid).toHaveBeenCalledWith(createClientDto.cpf);
            expect(clientRepository.findOneBy).toHaveBeenCalledWith({ cpf: createClientDto.cpf });
            expect(clientRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ id: mockUlid })
            );
            expect(result).toBe(mockClient);
        });

        it("should throw BadRequestException for invalid CPF", async () => {
            const { cpf } = require("cpf-cnpj-validator");
            cpf.isValid.mockReturnValue(false);

            await expect(service.createClient(createClientDto))
                .rejects.toThrow(BadRequestException);
        });

        it("should not create client if CPF already exists", async () => {
            const { cpf } = require("cpf-cnpj-validator");
            cpf.isValid.mockReturnValue(true);

            clientRepository.findOneBy.mockResolvedValue({ id: "1", cpf: createClientDto.cpf } as any);

            await expect(service.createClient(createClientDto))
                .rejects.toThrow(BadRequestException);
        });

        it("should generate ulid for client id", async () => {
            const { cpf } = require("cpf-cnpj-validator");
            cpf.isValid.mockReturnValue(true);
            clientRepository.findOneBy.mockResolvedValue(null);

            const mockUlid = "01HULIDTEST";
            (ulid as jest.MockedFunction<typeof ulid>).mockReturnValue(mockUlid);

            await service.createClient(createClientDto);

            expect(ulid).toHaveBeenCalled();
            expect(clientRepository.create)
                .toHaveBeenCalledWith(expect.objectContaining({ id: mockUlid }));
        });
    });
});