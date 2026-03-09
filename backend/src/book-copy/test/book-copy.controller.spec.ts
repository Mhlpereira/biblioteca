import { Test, TestingModule } from "@nestjs/testing";
import { BookCopyController } from "../book-copy.controller";
import { AddCopyUseCase } from "../usecase/add-copy.usecase";
import { FindAllByBookUseCase } from "../usecase/find-all-by-book.usecase";
import { FindAvailableCopyByBookIdUseCase } from "../usecase/find-available-copy-by-book-id.usecase";
import { RemoveCopyUseCase } from "../usecase/remove-copy.usecase";
import { AddBookCopyDto } from "../dto/request/add-copy-request.dto";
import { RemoveCopyDto } from "../dto/request/remove-copy-request.dto";
import { BookCopyOutputDto } from "../dto/response/book-copy-output.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination-response.dto";

describe("BookCopyController", () => {
    let controller: BookCopyController;

    const mockAddCopyUseCase = { execute: jest.fn() };
    const mockFindAllByBookUseCase = { execute: jest.fn() };
    const mockFindAvailableCopyByBookIdUseCase = { execute: jest.fn() };
    const mockRemoveCopyUseCase = { execute: jest.fn() };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BookCopyController],
            providers: [
                { provide: AddCopyUseCase, useValue: mockAddCopyUseCase },
                { provide: FindAllByBookUseCase, useValue: mockFindAllByBookUseCase },
                { provide: FindAvailableCopyByBookIdUseCase, useValue: mockFindAvailableCopyByBookIdUseCase },
                { provide: RemoveCopyUseCase, useValue: mockRemoveCopyUseCase },
            ],
        }).compile();

        controller = module.get(BookCopyController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("addCopy", () => {
        it("should call addCopyUseCase.execute and return the result", async () => {
            const dto: AddBookCopyDto = { bookId: "book-123", quantity: 2 };
            const expected = { success: true };
            mockAddCopyUseCase.execute.mockResolvedValue(expected);

            const result = await controller.addCopy(dto);

            expect(mockAddCopyUseCase.execute).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });
    });

    describe("removeCopy", () => {
        it("should call removeCopyUseCase.execute and return the result", async () => {
            const dto: RemoveCopyDto = { copyId: "copy-123" };
            const expected = { success: true };
            mockRemoveCopyUseCase.execute.mockResolvedValue(expected);

            const result = await controller.removeCopy(dto);

            expect(mockRemoveCopyUseCase.execute).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });
    });

    describe("getCopies", () => {
        it("should call findAllByBookUseCase.execute with bookId and return paginated result", async () => {
            const bookId = "book-123";
            const expected: PaginatedResponseDto<BookCopyOutputDto> = {
                data: [
                    { id: "copy-1", status: "AVAILABLE", bookId, bookTitle: "Title" },
                ],
                meta: { total: 1, page: 1, lastPage: 1 },
            };
            mockFindAllByBookUseCase.execute.mockResolvedValue(expected);

            const result = await controller.getCopies(bookId);

            expect(mockFindAllByBookUseCase.execute).toHaveBeenCalledWith({ bookId });
            expect(result).toEqual(expected);
        });
    });

    describe("getAvailableCopy", () => {
        it("should call findAvailableCopyByBookIdUseCase.execute and return a copy", async () => {
            const bookId = { bookId: "book-123" };
            const expected: BookCopyOutputDto = {
                id: "copy-1",
                status: "AVAILABLE",
                bookId: "book-123",
                bookTitle: "Title",
            };
            mockFindAvailableCopyByBookIdUseCase.execute.mockResolvedValue(expected);

            const result = await controller.getAvailableCopy(bookId);

            expect(mockFindAvailableCopyByBookIdUseCase.execute).toHaveBeenCalledWith(bookId);
            expect(result).toEqual(expected);
        });

        it("should return null when no available copy exists", async () => {
            const bookId = { bookId: "book-123" };
            mockFindAvailableCopyByBookIdUseCase.execute.mockResolvedValue(null);

            const result = await controller.getAvailableCopy(bookId);

            expect(mockFindAvailableCopyByBookIdUseCase.execute).toHaveBeenCalledWith(bookId);
            expect(result).toBeNull();
        });
    });
});
