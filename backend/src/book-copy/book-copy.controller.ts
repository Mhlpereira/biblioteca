import { Controller, Post, Param, Get, Body, HttpCode, Patch } from "@nestjs/common";
import { RemoveCopyDto } from "./dto/request/remove-copy-request.dto";
import { PaginatedResponseDto } from "../common/dto/pagination-response.dto";
import { AddBookCopyDto } from "./dto/request/add-copy-request.dto";
import { AddCopyUseCase } from "./usecase/add-copy.usecase";
import { FindAllByBookUseCase } from "./usecase/find-all-by-book.usecase";
import { FindAvailableCopyByBookIdUseCase } from "./usecase/find-available-copy-by-book-id.usecase";
import { RemoveCopyUseCase } from "./usecase/remove-copy.usecase";
import { BookCopyOutputDto } from "./dto/response/book-copy-output.dto";
import { FindAvailableCopyDto } from "./dto/query/find-available-copy.dto";

@Controller("books/:bookId/copies")
export class BookCopyController {
    constructor(
        private readonly addCopyUseCase: AddCopyUseCase,
        private readonly findAllByBookUseCase: FindAllByBookUseCase,
        private readonly findAvailableCopyByBookIdUseCase: FindAvailableCopyByBookIdUseCase,
        private readonly removeCopyUseCase: RemoveCopyUseCase,
    ) {}

    @Post()
    @HttpCode(200)
    async addCopy(@Body() addBookCopyDto: AddBookCopyDto) {
        return this.addCopyUseCase.execute(addBookCopyDto);
    }

    @Patch("remove")
    @HttpCode(200)
    async removeCopy(@Body() removeCopyDto: RemoveCopyDto) {
        return this.removeCopyUseCase.execute(removeCopyDto);
    }

    @Get(":id")
    @HttpCode(200)
    async getCopies(@Param("bookId") bookId: string): Promise <PaginatedResponseDto<BookCopyOutputDto>>{
        const result = await this.findAllByBookUseCase.execute({ bookId });
        return result;
    }

    @Get("available")
    @HttpCode(200)
    async getAvailableCopy(@Param("bookId") bookId: FindAvailableCopyDto): Promise<BookCopyOutputDto | null> {
        return this.findAvailableCopyByBookIdUseCase.execute(bookId);
    }
}
