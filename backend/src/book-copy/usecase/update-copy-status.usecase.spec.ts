import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCopyStatusUseCase } from './update-copy-status.usecase';
import { BookCopyRepositoryOutPort } from '../ports/book-copy-out.port';
import { UpdateCopyStatusInput } from '../ports/in/update-copy-status.in';
import { BookCopyStatus } from '../enum/book-status.enum';

describe('UpdateCopyStatusUseCase', () => {
  let useCase: UpdateCopyStatusUseCase;
  let bookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort>;

  beforeEach(async () => {
    const mockBookCopyRepository: jest.Mocked<BookCopyRepositoryOutPort> = {
      addCopies: jest.fn(),
      findByIdWithBook: jest.fn(),
      findAvailableByBookId: jest.fn(),
      updateStatus: jest.fn(),
      findAllByBook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCopyStatusUseCase,
        {
          provide: 'BookCopyRepositoryOutPort',
          useValue: mockBookCopyRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateCopyStatusUseCase>(UpdateCopyStatusUseCase);
    bookCopyRepository = module.get('BookCopyRepositoryOutPort');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update copy status to AVAILABLE', async () => {

      const input: UpdateCopyStatusInput = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        status: BookCopyStatus.AVAILABLE,
      };

      bookCopyRepository.updateStatus.mockResolvedValue(undefined);


      await useCase.execute(input);


      expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(
        input.copyId,
        BookCopyStatus.AVAILABLE
      );
    });

    it('should update copy status to RESERVED', async () => {

      const input: UpdateCopyStatusInput = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        status: BookCopyStatus.RESERVED,
      };

      bookCopyRepository.updateStatus.mockResolvedValue(undefined);


      await useCase.execute(input);


      expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(
        input.copyId,
        BookCopyStatus.RESERVED
      );
    });

    it('should update copy status to REMOVED', async () => {

      const input: UpdateCopyStatusInput = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        status: BookCopyStatus.REMOVED,
      };

      bookCopyRepository.updateStatus.mockResolvedValue(undefined);


      await useCase.execute(input);


      expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(
        input.copyId,
        BookCopyStatus.REMOVED
      );
    });

    it('should handle status as string and cast to BookCopyStatus', async () => {

      const input: UpdateCopyStatusInput = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        status: 'AVAILABLE' as any, 
      };

      bookCopyRepository.updateStatus.mockResolvedValue(undefined);


      await useCase.execute(input);


      expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(
        input.copyId,
        'AVAILABLE' as BookCopyStatus
      );
    });

    it('should propagate repository errors', async () => {

      const input: UpdateCopyStatusInput = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        status: BookCopyStatus.AVAILABLE,
      };

      const error = new Error('Database connection failed');
      bookCopyRepository.updateStatus.mockRejectedValue(error);


      await expect(useCase.execute(input)).rejects.toThrow('Database connection failed');
    });

    it('should not return any value', async () => {

      const input: UpdateCopyStatusInput = {
        copyId: '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        status: BookCopyStatus.AVAILABLE,
      };

      bookCopyRepository.updateStatus.mockResolvedValue(undefined);


      const result = await useCase.execute(input);


      expect(result).toBeUndefined();
    });

    it('should handle different copy IDs', async () => {

      const copyIds = [
        '01HJQZ5R3N7MTXVGQE5J8K9M0Q',
        '01HJQZ5R3N7MTXVGQE5J8K9M0R',
        '01HJQZ5R3N7MTXVGQE5J8K9M0S',
      ];

      for (const copyId of copyIds) {
        const input: UpdateCopyStatusInput = {
          copyId,
          status: BookCopyStatus.AVAILABLE,
        };

        bookCopyRepository.updateStatus.mockResolvedValue(undefined);


        await useCase.execute(input);


        expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(
          copyId,
          BookCopyStatus.AVAILABLE
        );

        jest.clearAllMocks();
      }
    });

    it('should handle all valid book copy statuses', async () => {

      const statuses = [BookCopyStatus.AVAILABLE, BookCopyStatus.RESERVED, BookCopyStatus.REMOVED];
      const copyId = '01HJQZ5R3N7MTXVGQE5J8K9M0Q';

      for (const status of statuses) {
        const input: UpdateCopyStatusInput = {
          copyId,
          status,
        };

        bookCopyRepository.updateStatus.mockResolvedValue(undefined);


        await useCase.execute(input);


        expect(bookCopyRepository.updateStatus).toHaveBeenCalledWith(copyId, status);

        jest.clearAllMocks();
      }
    });
  });
});
