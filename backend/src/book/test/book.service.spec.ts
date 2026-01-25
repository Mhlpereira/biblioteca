import { Test, TestingModule } from "@nestjs/testing";
import { BookService } from "../book.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Book } from "../entities/book.entity";
import { Repository } from "typeorm";
import { BookCopyService } from "../../book-copy/book-copy.service";
import { NotFoundException } from "@nestjs/common";
import { BookCopyStatus } from "../../book-copy/enum/book-status.enum";

describe("BookService", () => {
    let service: BookService;
    let bookRepository: jest.Mocked<Repository<Book>>;
    let bookCopyService: jest.Mocked<BookCopyService>;

    const mockBookRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOneBy: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockBookCopyService = {
        addCopies: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookService,
                {
                    provide: getRepositoryToken(Book),
                    useValue: mockBookRepository,
                },
                {
                    provide: BookCopyService,
                    useValue: mockBookCopyService,
                },
            ],
        }).compile();

        service = module.get(BookService);
        bookRepository = module.get(getRepositoryToken(Book));
        bookCopyService = module.get(BookCopyService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createBook", () => {
        it("should create a book and its copies", async () => {
            const bookMock = {
                id: "book-id",
                title: "Clean Code",
                author: "Robert Martin",
            } as Book;

            mockBookRepository.create.mockReturnValue(bookMock);
            mockBookRepository.save.mockResolvedValue(bookMock);
            mockBookCopyService.addCopies.mockResolvedValue([{}, {}, {}] as any);

            const result = await service.createBook({
                title: "Clean Code",
                author: "Robert Martin",
                quantity: 3,
            });

            expect(bookRepository.create).toHaveBeenCalled();
            expect(bookRepository.save).toHaveBeenCalledWith(bookMock);
            expect(bookCopyService.addCopies).toHaveBeenCalledWith(bookMock, 3);

            expect(result).toEqual({
                id: bookMock.id,
                title: bookMock.title,
                author: bookMock.author,
                copies: 3,
            });
        });
    });

    describe("findBookById", () => {
        it("should return a book when found", async () => {
            const bookMock = { id: "1" } as Book;

            mockBookRepository.findOneBy.mockResolvedValue(bookMock);

            const result = await service.findBookById("1");

            expect(result).toBe(bookMock);
        });

        it("should throw NotFoundException when book does not exist", async () => {
            mockBookRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findBookById("1"))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe("findAll", () => {
        it("should return mapped book list", async () => {
            const qb: any = {
                leftJoin: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                setParameter: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                having: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([
                    {
                        id: "1",
                        title: "Clean Code",
                        author: "Robert Martin",
                        totalcopies: "5",
                        availablecopies: "2",
                        imageurl: null,
                    },
                ]),
            };

            mockBookRepository.createQueryBuilder.mockReturnValue(qb);

            const result = await service.findAll({});

            expect(result).toEqual([
                {
                    id: "1",
                    title: "Clean Code",
                    author: "Robert Martin",
                    totalCopies: 5,
                    availableCopies: 2,
                    hasAvailable: true,
                    imageUrl: "",
                },
            ]);
        });

        it("should apply onlyAvailable filter", async () => {
            const qb: any = {
                leftJoin: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                setParameter: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                having: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([]),
            };

            mockBookRepository.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ onlyAvailable: true });

            expect(qb.having).toHaveBeenCalledWith("availableCopies > 0");
        });
    });

    describe("update", () => {
        it("should update book fields", async () => {
            const bookMock = {
                id: "1",
                title: "Old",
                author: "Old Author",
            } as Book;

            jest.spyOn(service, "findBookById").mockResolvedValue(bookMock);
            mockBookRepository.save.mockResolvedValue({
                ...bookMock,
                title: "New",
            });

            const result = await service.update("1", {
                title: "New",
            });

            expect(bookMock.title).toBe("New");
            expect(bookRepository.save).toHaveBeenCalledWith(bookMock);
            expect(result.title).toBe("New");
        });
    });

    describe("deactivate", () => {
        it("should deactivate a book", async () => {
            const bookMock = {
                id: "1",
                active: true,
            } as Book;

            jest.spyOn(service, "findBookById").mockResolvedValue(bookMock);
            mockBookRepository.save.mockResolvedValue({
                ...bookMock,
                active: false,
            });

            const result = await service.deactivate("1");

            expect(bookMock.active).toBe(false);
            expect(bookRepository.save).toHaveBeenCalledWith(bookMock);
            expect(result.active).toBe(false);
        });
    });
});
