import { Test, TestingModule } from "@nestjs/testing";
import { BookController } from "../book.controller";
import { CreateBookUseCase } from "../use-cases/create-book-usecase";
import { DeactivateBookUseCase } from "../use-cases/deactivate-book-usecase";
import { GetBookByIdUseCase } from "../use-cases/get-book-by-id-usecase";
import { UpdateBookUseCase } from "../use-cases/update-book-usecase";
import { FindAllBooksUseCase } from "../use-cases/find-all-books-usecase";
import { CreateBookDto } from "../dto/request/book-create.dto";
import { UpdateBookDto } from "../dto/request/update-book.dto";
import { FindBooksQueryDto } from "../dto/query/find-book-query.dto";


describe("BookController", () => {
  let controller: BookController;
  let createBookUseCase: CreateBookUseCase;
  let deactivateBookUseCase: DeactivateBookUseCase;
  let getBookByIdUseCase: GetBookByIdUseCase;
  let updateBookUseCase: UpdateBookUseCase;
  let findAllBooksUseCase: FindAllBooksUseCase;

  const mockCreateBookUseCase = {
    execute: jest.fn(),
  };

  const mockDeactivateBookUseCase = {
    execute: jest.fn(),
  };

  const mockGetBookByIdUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateBookUseCase = {
    execute: jest.fn(),
  };

  const mockFindAllBooksUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: CreateBookUseCase,
          useValue: mockCreateBookUseCase,
        },
        {
          provide: DeactivateBookUseCase,
          useValue: mockDeactivateBookUseCase,
        },
        {
          provide: GetBookByIdUseCase,
          useValue: mockGetBookByIdUseCase,
        },
        {
          provide: UpdateBookUseCase,
          useValue: mockUpdateBookUseCase,
        },
        {
          provide: FindAllBooksUseCase,
          useValue: mockFindAllBooksUseCase,
        },
      ],
    }).compile();

    controller = module.get<BookController>(BookController);
    createBookUseCase = module.get<CreateBookUseCase>(CreateBookUseCase);
    deactivateBookUseCase = module.get<DeactivateBookUseCase>(DeactivateBookUseCase);
    getBookByIdUseCase = module.get<GetBookByIdUseCase>(GetBookByIdUseCase);
    updateBookUseCase = module.get<UpdateBookUseCase>(UpdateBookUseCase);
    findAllBooksUseCase = module.get<FindAllBooksUseCase>(FindAllBooksUseCase);
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

      mockCreateBookUseCase.execute.mockResolvedValue(expected);

      const result = await controller.createBook(dto);

      expect(createBookUseCase.execute).toHaveBeenCalledWith({
        title: dto.title,
        author: dto.author,
        imageUrl: dto.imageUrl,
        quantity: dto.quantity,
      });
      expect(createBookUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });

    it("should propagate service error", async () => {
      const dto = {} as CreateBookDto;

      mockCreateBookUseCase.execute.mockRejectedValue(
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

      mockFindAllBooksUseCase.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(findAllBooksUseCase.execute).toHaveBeenCalledWith(query);
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

      mockGetBookByIdUseCase.execute.mockResolvedValue(book);

      const result = await controller.findOne("1");

      expect(getBookByIdUseCase.execute).toHaveBeenCalledWith({ id: "1" });
      expect(result).toEqual(book);
    });

    it("should propagate not found error", async () => {
      mockGetBookByIdUseCase.execute.mockRejectedValue(
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

      mockUpdateBookUseCase.execute.mockResolvedValue(updatedBook);

      const result = await controller.update("1", dto);

      expect(updateBookUseCase.execute).toHaveBeenCalledWith({
        id: "1",
        ...dto,
      });
      expect(result).toEqual(updatedBook);
    });
  });

  describe("PATCH /books/:id/deactivate", () => {
    it("should deactivate a book", async () => {
      const deactivatedBook = {
        id: "1",
        active: false,
      };

      mockDeactivateBookUseCase.execute.mockResolvedValue(deactivatedBook);

      const result = await controller.deactivate("1");

      expect(deactivateBookUseCase.execute).toHaveBeenCalledWith({ id: "1" });
      expect(result).toEqual(deactivatedBook);
    });
  });
});
