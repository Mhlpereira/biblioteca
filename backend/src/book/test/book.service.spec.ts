import { Test, TestingModule } from "@nestjs/testing";
import { BookService } from "../book.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Book } from "../entities/book.entity";
import { Repository } from "typeorm";
import { BookCopyService } from "../../book-copy/book-copy.service";
import { NotFoundException } from "@nestjs/common";
import { BookCopyStatus } from "../../book-copy/enum/book-status.enum";

describe("BookService (unit)", () => {
    let service: BookService;
    let bookRepository: jest.Mocked<Repository<Book>>;
    let bookCopyService: jest.Mocked<BookCopyService>;

    const RAW_BOOK_LIST = [
        {
            id: "1",
            title: "Clean Code",
            author: "Robert Martin",
            totalcopies: "5",
            availablecopies: "2",
            imageurl: null,
        },
    ];

    const createQueryBuilderMock = (rawResult: any[] = []) => {
        const qb: any = {
            leftJoin: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            setParameter: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            having: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            clone: jest.fn(), // será setado abaixo
            getRawMany: jest.fn().mockResolvedValue(rawResult),
        };

        // clone() precisa devolver outro qb com getRawMany (para contar total)
        const cloneQb: any = {
            ...qb,
            getRawMany: jest.fn().mockResolvedValue(rawResult),
        };

        qb.clone.mockReturnValue(cloneQb);

        return qb;
    };

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
                { provide: getRepositoryToken(Book), useValue: mockBookRepository },
                { provide: BookCopyService, useValue: mockBookCopyService },
            ],
        }).compile();

        service = module.get(BookService);
        bookRepository = module.get(getRepositoryToken(Book));
        bookCopyService = module.get(BookCopyService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createBook", () => {
        it("creates a book and copies, returns correct response", async () => {
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
                imageUrl: "http://example.com/img.png",
            });

            expect(bookRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expect.any(String), // ulid()
                    title: "Clean Code",
                    author: "Robert Martin",
                    quantity: 3, // vai vir no spread, não faz mal
                })
            );
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
        it("returns a book when found", async () => {
            const bookMock = { id: "1" } as Book;
            mockBookRepository.findOneBy.mockResolvedValue(bookMock);

            const result = await service.findBookById("1");

            expect(bookRepository.findOneBy).toHaveBeenCalledWith({ id: "1" });
            expect(result).toBe(bookMock);
        });

        it("throws NotFoundException when not found", async () => {
            mockBookRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findBookById("1")).rejects.toThrow(NotFoundException);
        });
    });

    describe("findAll", () => {
        it("returns paginated mapped list and meta", async () => {
            const qb = createQueryBuilderMock(RAW_BOOK_LIST);
            mockBookRepository.createQueryBuilder.mockReturnValue(qb);

            const result = await service.findAll({});

            // valida paginação default
            expect(result.meta).toEqual({
                total: 1,
                page: 1,
                lastPage: 1,
            });

            expect(result.data).toEqual([
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

            // valida que o query builder foi configurado com active=true e available status
            expect(qb.where).toHaveBeenCalledWith("book.active = :active", { active: true });
            expect(qb.setParameter).toHaveBeenCalledWith("available", BookCopyStatus.AVAILABLE);

            // valida que limit/offset foram aplicados (defaults: page=1 limit=10 => offset=0)
            expect(qb.limit).toHaveBeenCalledWith(10);
            expect(qb.offset).toHaveBeenCalledWith(0);
        });

        it("applies title filter", async () => {
            const qb = createQueryBuilderMock([]);
            mockBookRepository.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ title: "clean" });

            expect(qb.andWhere).toHaveBeenCalledWith("LOWER(book.title) LIKE LOWER(:title)", { title: "%clean%" });
        });

        it("applies author filter", async () => {
            const qb = createQueryBuilderMock([]);
            mockBookRepository.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ author: "martin" });

            expect(qb.andWhere).toHaveBeenCalledWith("LOWER(book.author) LIKE LOWER(:author)", { author: "%martin%" });
        });

        it("applies onlyAvailable having clause", async () => {
            const qb = createQueryBuilderMock([]);
            mockBookRepository.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ onlyAvailable: true });

            expect(qb.having).toHaveBeenCalled();
        });

        it("supports pagination page/limit", async () => {
            const qb = createQueryBuilderMock(RAW_BOOK_LIST);
            mockBookRepository.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ page: 2, limit: 10 });

            // page=2 => skip=(2-1)*10=10
            expect(qb.limit).toHaveBeenCalledWith(10);
            expect(qb.offset).toHaveBeenCalledWith(10);
        });
    });

    describe("update", () => {
        it("updates only provided fields", async () => {
            const bookMock = { id: "1", title: "Old", author: "Old Author" } as Book;

            jest.spyOn(service, "findBookById").mockResolvedValue(bookMock);
            mockBookRepository.save.mockImplementation(async b => b as any);

            const result = await service.update("1", { title: "New" });

            expect(bookMock.title).toBe("New");
            expect(bookMock.author).toBe("Old Author"); // não mudou
            expect(bookRepository.save).toHaveBeenCalledWith(bookMock);
            expect(result.title).toBe("New");
        });
    });

    describe("deactivate", () => {
        it("sets active=false and persists", async () => {
            const bookMock = { id: "1", active: true } as Book;

            jest.spyOn(service, "findBookById").mockResolvedValue(bookMock);
            mockBookRepository.save.mockImplementation(async b => b as any);

            const result = await service.deactivate("1");

            expect(bookMock.active).toBe(false);
            expect(bookRepository.save).toHaveBeenCalledWith(bookMock);
            expect(result.active).toBe(false);
        });
    });
});
