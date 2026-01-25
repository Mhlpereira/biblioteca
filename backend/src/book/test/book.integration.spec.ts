import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookService } from "../book.service";
import { Book } from "../entities/book.entity";
import { BookCopy } from "../../book-copy/entities/book-copy.entity";
import { BookCopyService } from "../../book-copy/book-copy.service";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { BookCopyStatus } from "../../book-copy/enum/book-status.enum";

describe("BookService (integration)", () => {
    let module: TestingModule;
    let bookService: BookService;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: "sqlite",
                    database: ":memory:",
                    dropSchema: true,
                    entities: [Book, BookCopy],
                    synchronize: true,
                    namingStrategy: new SnakeNamingStrategy(),
                    logging: false,
                }),
                TypeOrmModule.forFeature([Book, BookCopy]),
            ],
            providers: [BookService, BookCopyService],
        }).compile();

        bookService = module.get(BookService);
    });

    afterAll(async () => {
        await module.close();
    });

    it("should create a book with copies and list it correctly", async () => {
        const created = await bookService.createBook({
            title: "Clean Architecture",
            author: "Robert Martin",
            quantity: 3,
        });

        expect(created).toEqual({
            id: expect.any(String),
            title: "Clean Architecture",
            author: "Robert Martin",
            copies: 3,
        });

        const books = await bookService.findAll({});

        expect(books).toHaveLength(1);
        expect(books[0]).toMatchObject({
            title: "Clean Architecture",
            author: "Robert Martin",
            totalCopies: 3,
            availableCopies: 3,
            hasAvailable: true,
        });
    });

    it("should filter only available books", async () => {
        const book = (await bookService.findAll({}))[0];

        const copies = await (module.get("BookCopyRepository") as any).find();

        for (const copy of copies) {
            copy.status = BookCopyStatus.REMOVED;
            await (module.get("BookCopyRepository") as any).save(copy);
        }

        const books = await bookService.findAll({ onlyAvailable: true });

        expect(books).toHaveLength(0);
    });
});
