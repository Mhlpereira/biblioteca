import { Test, TestingModule } from "@nestjs/testing";
import { BookController } from "../book.controller";
import { BookService } from "../book.service";
import { CreateBookDto } from "../dto/book-create.dto";
import { UpdateBookDto } from "../dto/update-book.dto";
import { FindBooksQueryDto } from "../dto/find-book-query.dto";

describe("BookController", () => {
  let controller: BookController;
  let service: BookService;

  const mockBookService = {
    createBook: jest.fn(),
    findAll: jest.fn(),
    findBookById: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    controller = module.get<BookController>(BookController);
    service = module.get<BookService>(BookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("POST /books/create", () => {
    it("should create a book", async () => {
      const dto: CreateBookDto = {
        title: "Clean Code",
        author: "Robert Martin",
        quantity: 3,
        imageUrl: "image.png",
      };

      const expected = {
        id: "book-id",
        title: dto.title,
        author: dto.author,
        copies: 3,
      };

      mockBookService.createBook.mockResolvedValue(expected);

      const result = await controller.createBook(dto);

      expect(service.createBook).toHaveBeenCalledWith(dto);
      expect(service.createBook).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });

    it("should propagate service error", async () => {
      const dto = {} as CreateBookDto;

      mockBookService.createBook.mockRejectedValue(
        new Error("Invalid data"),
      );

      await expect(controller.createBook(dto)).rejects.toThrow(
        "Invalid data",
      );
    });
  });

  describe("GET /books", () => {
    it("should return list of books", async () => {
      const query: FindBooksQueryDto = {
        title: "Clean",
      };

      const expected = [
        {
          id: "1",
          title: "Clean Code",
          author: "Robert Martin",
          totalCopies: 3,
          availableCopies: 2,
          hasAvailable: true,
          imageUrl: "",
        },
      ];

      mockBookService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe("GET /books/:id", () => {
    it("should return a book by id", async () => {
      const book = {
        id: "1",
        title: "Domain Driven Design",
        author: "Eric Evans",
      };

      mockBookService.findBookById.mockResolvedValue(book);

      const result = await controller.findOne("1");

      expect(service.findBookById).toHaveBeenCalledWith("1");
      expect(result).toEqual(book);
    });

    it("should propagate not found error", async () => {
      mockBookService.findBookById.mockRejectedValue(
        new Error("Livro não encontrado"),
      );

      await expect(controller.findOne("x")).rejects.toThrow(
        "Livro não encontrado",
      );
    });
  });

  describe("PATCH /books/:id", () => {
    it("should update a book", async () => {
      const dto: UpdateBookDto = {
        title: "Updated title",
      };

      const updatedBook = {
        id: "1",
        title: dto.title,
        author: "Someone",
      };

      mockBookService.update.mockResolvedValue(updatedBook);

      const result = await controller.update("1", dto);

      expect(service.update).toHaveBeenCalledWith("1", dto);
      expect(result).toEqual(updatedBook);
    });
  });

  describe("PATCH /books/:id/deactivate", () => {
    it("should deactivate a book", async () => {
      const deactivatedBook = {
        id: "1",
        active: false,
      };

      mockBookService.deactivate.mockResolvedValue(deactivatedBook);

      const result = await controller.deativate("1");

      expect(service.deactivate).toHaveBeenCalledWith("1");
      expect(result).toEqual(deactivatedBook);
    });
  });
});
