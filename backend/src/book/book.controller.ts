import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PaginatedResponseDto } from '../common/dto/pagination-response.dto';
import { BookCreateOutput } from './dto/response/book-create-output.dto';
import { BookListResponseDto } from './dto/response/list-book-output.dto';
import { CreateBookUseCase } from './use-cases/create-book-usecase';
import { DeactivateBookUseCase } from './use-cases/deactivate-book-usecase';
import { GetBookByIdUseCase } from './use-cases/get-book-by-id-usecase';
import { UpdateBookUseCase } from './use-cases/update-book-usecase';
import { FindAllBooksUseCase } from './use-cases/find-all-books-usecase';
import { CreateBookDto } from './dto/request/book-create.dto';
import { FindBooksQueryDto } from './dto/query/find-book-query.dto';
import { UpdateBookDto } from './dto/request/update-book.dto';



@Controller('books')
export class BookController {
  constructor(
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly getBookByIdUseCase: GetBookByIdUseCase,
    private readonly findAllBooksUseCase: FindAllBooksUseCase,
    private readonly updateBookUseCase: UpdateBookUseCase,
    private readonly deactivateBookUseCase: DeactivateBookUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create book' })
  @ApiResponse({ status: 201, description: 'Book created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBook(@Body() dto: CreateBookDto): Promise<BookCreateOutput> {
    return this.createBookUseCase.execute({
      title: dto.title,
      author: dto.author,
      imageUrl: dto.imageUrl,
      quantity: dto.quantity,
    });
  }

  @Get()
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Search books' })
  @ApiResponse({ status: 200, description: 'List of books' })
  @ApiResponse({ status: 404, description: 'No books are found' })
  async findAll(@Query() query: FindBooksQueryDto): Promise<PaginatedResponseDto<BookListResponseDto>> {
    return this.findAllBooksUseCase.execute({ 
      page: query.page,
      limit: query.limit,
      title: query.title,
      author: query.author,
      onlyAvailable: query.onlyAvailable,
    });
  }

  @Get(':id')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Find book by id' })
  @ApiResponse({ status: 200, description: 'Book found' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async findOne(@Param('id') id: string) {
    return this.getBookByIdUseCase.execute({ id });
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update book info' })
  @ApiResponse({ status: 200, description: 'Book updated' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.updateBookUseCase.execute({
      id,
      title: dto.title,
      author: dto.author,
    });
  }

  @Patch(':id/deactivate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate book' })
  @ApiResponse({ status: 200, description: 'Book deactivated' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async deactivate(@Param('id') id: string) {
    return this.deactivateBookUseCase.execute({ id });
  }
}