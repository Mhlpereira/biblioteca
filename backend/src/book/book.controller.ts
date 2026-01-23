import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from "@nestjs/common";
import { BookService } from "./book.service";
import { CreateBookDto } from "./dto/book-create.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BookCreateOutput } from "./dto/book-create-output.dto";
import { AddBookCopyDto } from "../book-copy/dto/copy-add.dto";
import { FindBooksQueryDto } from "./dto/find-book-query.dto";

@Controller("books")
export class BookController {
    constructor(private readonly bookService: BookService) {}

    @Post("create")
    @HttpCode(201)
    @ApiOperation({ summary: "Create book" })
    @ApiResponse({ status: 201, description: "Book created" })
    @ApiResponse({ status: 400, description: "Invalid request data" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async createBook(@Body() createBookDto: CreateBookDto): Promise<BookCreateOutput> {
        return this.bookService.createBook(createBookDto);
    }

    @Post("add")
    @HttpCode(200)
    @ApiOperation({ summary: "Add book copy" })
    @ApiResponse({ status: 201, description: "Book copy added" })
    @ApiResponse({ status: 400, description: "Invalid request data" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 404, description: "Book doesnt exist" })
    async addBookCopy(@Body() addBookCopy: AddBookCopyDto) {}

    @Get()
    @HttpCode(200)
    @ApiOperation({summary: "Search books"})
    @ApiResponse({status: 200, description: "List of books"})
    async findAll(@Query() query: FindBooksQueryDto) {
        return this.bookService.findAll(query);
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.bookService.findBookById(id);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.bookService.update(id, updateBookDto);
    }

    @Patch(":id/deactivate")
    async deativate(@Param("id") id: string) {
        return this.bookService.deactivate(id);
    }
}

