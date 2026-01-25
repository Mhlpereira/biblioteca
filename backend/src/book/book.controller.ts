import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from "@nestjs/common";
import { BookService } from "./book.service";
import { CreateBookDto } from "./dto/book-create.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BookCreateOutput } from "./dto/book-create-output.dto";
import { FindBooksQueryDto } from "./dto/find-book-query.dto";
import { DenyRoles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enum/role.enum";

@Controller("books")
export class BookController {
    constructor(private readonly bookService: BookService) {}

    @Post("create")
    @DenyRoles(Role.USER)
    @HttpCode(201)
    @ApiOperation({ summary: "Create book" })
    @ApiResponse({ status: 201, description: "Book created" })
    @ApiResponse({ status: 400, description: "Invalid request data" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async createBook(@Body() createBookDto: CreateBookDto): Promise<BookCreateOutput> {
        return this.bookService.createBook(createBookDto);
    }

    @Get()
    @HttpCode(200)
    @ApiOperation({ summary: "Search books" })
    @ApiResponse({ status: 200, description: "List of books" })
    @ApiResponse({ status: 404, description: "No books are found" })
    async findAll(@Query() query: FindBooksQueryDto) {
        return this.bookService.findAll(query);
    }

    @Get(":id")
    @HttpCode(200)
    @ApiOperation({ summary: "Find book by id" })
    @ApiResponse({ status: 200, description: "Book found" })
    @ApiResponse({ status: 404, description: "Book not found" })
    async findOne(@Param("id") id: string) {
        return this.bookService.findBookById(id);
    }

    @Patch(":id")
    @DenyRoles(Role.USER)
    @HttpCode(200)
    @ApiOperation({ summary: "Update book info" })
    @ApiResponse({ status: 200, description: "Book deactivated" })
    @ApiResponse({ status: 404, description: "Book not found" })
    async update(@Param("id") id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.bookService.update(id, updateBookDto);
    }

    @Patch(":id/deactivate")
    @DenyRoles(Role.USER)
    @HttpCode(200)
    @ApiOperation({ summary: "Deactivate book" })
    @ApiResponse({ status: 200, description: "Book deactivated", type: BookCreateOutput })
    async deativate(@Param("id") id: string) {
        return this.bookService.deactivate(id);
    }
}
