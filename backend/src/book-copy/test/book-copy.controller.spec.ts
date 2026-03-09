import { Test, TestingModule } from "@nestjs/testing";
import { BookCopyController } from "../book-copy.controller";
import { BookCopyService } from "../book-copy.service";
import { AddBookCopyDto } from "../dto/add-copy.dto";
import { RemoveCopyDto } from "../dto/request/remove-copy-request.dto";

describe("BookCopyController", () => {
    let controller: BookCopyController;
    let service: BookCopyService;

    const mockBookCopyService = {
        addCopyFromDto: jest.fn(),
        removeCopy: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BookCopyController],
            providers: [
                {
                    provide: BookCopyService,
                    useValue: mockBookCopyService,
                },
            ],
        }).compile();

        controller = module.get(BookCopyController);
        service = module.get(BookCopyService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("addCopy", () => {
        it("should call service.addCopyFromDto", async () => {
            const dto: AddBookCopyDto = {
                bookId: "book-123",
                quantity: 2,
            };

            mockBookCopyService.addCopyFromDto.mockResolvedValue({
                success: true,
            });

            const result = await controller.addCopy(dto);

            expect(service.addCopyFromDto).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ success: true });
        });
    });

    describe("removeCopy", () => {
        it("should call service.removeCopy", async () => {
            const dto: RemoveCopyDto = {
                copyId: "copy-123",
            };

            mockBookCopyService.removeCopy.mockResolvedValue({
                success: true,
            });

            const result = await controller.removeCopy(dto);

            expect(service.removeCopy).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ success: true });
        });
    });
});
