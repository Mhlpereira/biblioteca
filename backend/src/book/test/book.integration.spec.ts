import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { BookService } from "../book.service";
import { Book } from "../entities/book.entity";

import { BookCopy } from "../../book-copy/entities/book-copy.entity";
import { BookCopyService } from "../../book-copy/book-copy.service";
import { BookCopyStatus } from "../../book-copy/enum/book-status.enum";

describe("BookService (integration)", () => {
    let moduleRef: TestingModule;
    let service: BookService;
    let dataSource: DataSource;

    let bookRepo: Repository<Book>;
    let copyRepo: Repository<BookCopy>;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: "better-sqlite3",
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

        service = moduleRef.get(BookService);
        dataSource = moduleRef.get(DataSource);

        bookRepo = dataSource.getRepository(Book);
        copyRepo = dataSource.getRepository(BookCopy);
    });

    afterAll(async () => {
        await moduleRef.close();
    });

    beforeEach(async () => {
        await copyRepo.clear();
        await bookRepo.clear();
    });

    describe("createBook", () => {
        it("creates book and copies, returns correct shape", async () => {
            const created = await service.createBook({
                title: "Clean Architecture",
                author: "Robert Martin",
                quantity: 3,
                imageUrl: "http://example.com/img.png",
            });

            expect(created).toEqual({
                id: expect.any(String),
                title: "Clean Architecture",
                author: "Robert Martin",
                copies: 3,
                imageUrl: "http://example.com/img.png",
            });

            const bookInDb = await bookRepo.findOneBy({ id: created.id });
            expect(bookInDb).toBeTruthy();
            expect(bookInDb?.active).toBe(true);
            expect(bookInDb?.imageUrl).toBe("http://example.com/img.png");

            const copies = await copyRepo.find();
            expect(copies).toHaveLength(3);
            expect(copies.every(c => c.status === BookCopyStatus.AVAILABLE)).toBe(true);
        });
    });

    describe("findBookById", () => {
        it("returns book when exists", async () => {
            const created = await service.createBook({
                title: "The Pragmatic Programmer",
                author: "Andrew Hunt",
                quantity: 2,
                imageUrl: "http://example.com/img.png",
            });

            const found = await service.findBookById(created.id);

            expect(found).toMatchObject({
                id: created.id,
                title: "The Pragmatic Programmer",
                author: "Andrew Hunt",
                active: true,
            });
        });

        it("throws NotFoundException when not exists", async () => {
            await expect(service.findBookById("non-existent-id")).rejects.toThrow(/Livro não encontrado/i);
        });
    });

    describe("findAll", () => {
        it("lists books with total/available counts", async () => {
            await service.createBook({
                title: "Clean Architecture",
                author: "Robert Martin",
                quantity: 3,
                imageUrl: "http://example.com/img.png",
            });

            const result = await service.findAll({});

            expect(result).toMatchObject({
                meta: {
                    total: 1,
                    page: 1,
                    lastPage: 1,
                },
            });

            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toMatchObject({
                title: "Clean Architecture",
                author: "Robert Martin",
                totalCopies: 3,
                availableCopies: 3,
                hasAvailable: true,
            });
        });

        it("filters by title (case-insensitive)", async () => {
            await service.createBook({
                title: "Domain-Driven Design",
                author: "Evans",
                quantity: 1,
                imageUrl: "http:teste.com",
            });
            await service.createBook({
                title: "Clean Code",
                author: "Martin",
                quantity: 1,
                imageUrl: "http:teste.com",
            });

            const result = await service.findAll({ title: "clean" });

            expect(result.meta.total).toBe(1);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].title).toBe("Clean Code");
        });

        it("filters by author (case-insensitive)", async () => {
            await service.createBook({ title: "A", author: "Douglas Adams", quantity: 1, imageUrl: "http:teste.com" });
            await service.createBook({ title: "B", author: "Robert Martin", quantity: 1, imageUrl: "http:teste.com" });

            const result = await service.findAll({ author: "adams" });

            expect(result.meta.total).toBe(1);
            expect(result.data[0]).toMatchObject({ author: "Douglas Adams" });
        });

        it("onlyAvailable returns only books with availableCopies > 0", async () => {
            const created = await service.createBook({
                title: "Design Patterns",
                author: "GoF",
                quantity: 2,
                imageUrl: "http://example.com/img.png",
            });

            // zera disponibilidade
            const copies = await copyRepo.find({ where: { book: { id: created.id } } });
            for (const c of copies) {
                c.status = BookCopyStatus.REMOVED;
                await copyRepo.save(c);
            }

            const available = await service.findAll({ onlyAvailable: true });
            expect(available.data).toHaveLength(0);
            expect(available.meta.total).toBe(0);

            const all = await service.findAll({});
            expect(all.data).toHaveLength(1);
            expect(all.data[0].availableCopies).toBe(0);
            expect(all.data[0].hasAvailable).toBe(false);
        });

        it("counts available correctly when some are RESERVED", async () => {
            const created = await service.createBook({
                title: "Refactoring",
                author: "Fowler",
                quantity: 5,
                imageUrl: "http://example.com/img.png",
            });

            const copies = await copyRepo.find({
                where: { book: { id: created.id } },
                take: 2,
            });

            for (const c of copies) {
                c.status = BookCopyStatus.RESERVED;
                await copyRepo.save(c);
            }

            const result = await service.findAll({});
            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toMatchObject({
                totalCopies: 5,
                availableCopies: 3,
                hasAvailable: true,
            });
        });

        it("paginates (page/limit)", async () => {
            for (let i = 1; i <= 15; i++) {
                await service.createBook({
                    title: `Book ${i}`,
                    author: `Author ${i}`,
                    quantity: 1,
                    imageUrl: "http://example.com/img.png",
                });
            }

            const page1 = await service.findAll({ page: 1, limit: 10 });
            expect(page1.data).toHaveLength(10);
            expect(page1.meta).toMatchObject({ total: 15, page: 1, lastPage: 2 });

            const page2 = await service.findAll({ page: 2, limit: 10 });
            expect(page2.data).toHaveLength(5);
            expect(page2.meta).toMatchObject({ total: 15, page: 2, lastPage: 2 });
        });
    });

    describe("update", () => {
        it("updates title/author", async () => {
            const created = await service.createBook({
                title: "Old Title",
                author: "Old Author",
                quantity: 1,
                imageUrl: "http://example.com/img.png",
            });

            const updated = await service.update(created.id, {
                title: "New Title",
                author: "New Author",
            });

            expect(updated).toMatchObject({
                id: created.id,
                title: "New Title",
                author: "New Author",
            });

            const fromDb = await bookRepo.findOneBy({ id: created.id });
            expect(fromDb?.title).toBe("New Title");
            expect(fromDb?.author).toBe("New Author");
        });
    });

    describe("deactivate", () => {
        it("sets active=false and hides from findAll (which filters active=true)", async () => {
            const created = await service.createBook({
                title: "To Deactivate",
                author: "Someone",
                quantity: 1,
                imageUrl: "http://example.com/img.png",
            });

            const deactivated = await service.deactivate(created.id);
            expect(deactivated.active).toBe(false);

            const list = await service.findAll({});
            expect(list.data).toHaveLength(0);

            const stillInDb = await bookRepo.findOneBy({ id: created.id });
            expect(stillInDb).toBeTruthy();
            expect(stillInDb?.active).toBe(false);
        });
    });
});
