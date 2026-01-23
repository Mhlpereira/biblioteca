import { Controller, Post, Param, Get, Body, HttpCode, Patch } from "@nestjs/common";
import { BookCopyService } from "./book-copy.service";
import { AddBookCopyDto } from "./dto/add-copy.dto";
import { RemoveCopyDto } from "./dto/remove-copy.dto";

@Controller("books/:bookId/copies")
export class BookCopyController {
    constructor(private readonly bookCopyService: BookCopyService) {}

    @Post()
    @HttpCode(200)
    async addCopy(@Body() addBookCopyDto: AddBookCopyDto ) {
        return this.bookCopyService.addCopyFromDto(addBookCopyDto);
    }

    @Patch("remove")
    @HttpCode(200)
    async removeCopy(@Body() removeCopyDto: RemoveCopyDto){
        return this.bookCopyService.removeCopy(removeCopyDto);
    }

}
