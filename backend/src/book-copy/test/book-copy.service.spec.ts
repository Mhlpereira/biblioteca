import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Book } from "../../book/entities/book.entity";
import { BookCopyService } from "../book-copy.service";
import { BookCopy } from "../entities/book-copy.entity";
import { BookCopyStatus } from "../enum/book-status.enum";

describe("BookCopyService", () => {
    let service: BookCopyService;
    let bookCopyRepo: Repository<BookCopy>;
    let bookRepo: Repository<Book>;

    const bookMock = { id: "book-1", title: "Clean Code" } as Book;
    const copyMock = {
        id: "copy-1",
        status: BookCopyStatus.AVAILABLE,
        book: bookMock,
    } as BookCopy;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookCopyService,
                {
                    provide: getRepositoryToken(BookCopy),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Book),
                    useValue: {
                        findOneBy: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get(BookCopyService);
        bookCopyRepo = module.get(getRepositoryToken(BookCopy));
        bookRepo = module.get(getRepositoryToken(Book));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("addCopyFromDto", () => {
        it("adds copies when book exists", async () => {
            jest.spyOn(bookRepo, "findOneBy").mockResolvedValue(bookMock);
            jest.spyOn(service, "addCopies").mockResolvedValue([copyMock]);

            const result = await service.addCopyFromDto({
                bookId: "book-1",
                quantity: 1,
            });

            expect(result).toHaveLength(1);
        });

        it("throws when book does not exist", async () => {
            jest.spyOn(bookRepo, "findOneBy").mockResolvedValue(null);

            await expect(service.addCopyFromDto({ bookId: "x", quantity: 1 })).rejects.toBeInstanceOf(
                NotFoundException
            );
        });
    });

    describe("addCopies", () => {
        it("creates and saves copies", async () => {
            jest.spyOn(bookCopyRepo, "create").mockReturnValue(copyMock);
            jest.spyOn(bookCopyRepo, "save").mockResolvedValue([copyMock]as any);

            const result = await service.addCopies(bookMock, 1);

            expect(result).toHaveLength(1);
            expect(bookCopyRepo.save).toHaveBeenCalled();
        });
    });

    describe("removeCopy", () => {
        it("removes copy when available", async () => {
            jest.spyOn(bookCopyRepo, "findOne").mockResolvedValue(copyMock);
            jest.spyOn(bookCopyRepo, "save").mockResolvedValue(copyMock);

            const result = await service.removeCopy({ copyId: "copy-1" });

            expect(result.message).toBeDefined();
        });

        it("throws when copy not found", async () => {
            jest.spyOn(bookCopyRepo, "findOne").mockResolvedValue(null);

            await expect(service.removeCopy({ copyId: "x" })).rejects.toBeInstanceOf(NotFoundException);
        });

        it("throws when copy is not available", async () => {
            jest.spyOn(bookCopyRepo, "findOne").mockResolvedValue({
                ...copyMock,
                status: BookCopyStatus.REMOVED,
            } as BookCopy);

            await expect(service.removeCopy({ copyId: "copy-1" })).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    describe("findAvailableCopyByBookId", () => {
        it("returns copy when available", async () => {
            jest.spyOn(bookCopyRepo, "findOne").mockResolvedValue(copyMock);

            const result = await service.findAvailableCopyByBookId("book-1");

            expect(result).toBe(copyMock);
        });

        it("throws when no copies available", async () => {
            jest.spyOn(bookCopyRepo, "findOne").mockResolvedValue(null);

            await expect(service.findAvailableCopyByBookId("book-1")).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
