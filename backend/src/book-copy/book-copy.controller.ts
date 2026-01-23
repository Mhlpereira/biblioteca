import { Controller, Post, Param, Get } from "@nestjs/common";
import { BookCopyService } from "./book-copy.service";

@Controller("books/:bookId/copies")
export class BookCopyController {
    constructor(private readonly bookCopyService: BookCopyService) {}

    @Post()
    addCopy(@Param("bookId") bookId: string) {
        return this.bookCopyService.addCopy(bookId);
    }

    @Get("available")
    getAvailable(@Param("bookId") bookId: string) {
        return this.bookCopyService.getAvailableCopies(bookId);
    }
}
