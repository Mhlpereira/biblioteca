import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../app.module";

describe("BookCopyController (e2e)", () => {
    let app: INestApplication;

    beforeAll(async () => {
        process.env.NODE_ENV = "test";

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it("/books/:bookId/copies (POST)", async () => {
        const response = await request(app.getHttpServer())
            .post("/books/book-123/copies")
            .send({
                bookId: "book-123",
                amount: 1,
            })
            .expect(200);

        expect(response.body).toBeDefined();
    });

    it("/books/:bookId/copies/remove (PATCH)", async () => {
        const response = await request(app.getHttpServer())
            .patch("/books/book-123/copies/remove")
            .send({
                copyId: "copy-123",
            })
            .expect(200);

        expect(response.body).toBeDefined();
    });
});
