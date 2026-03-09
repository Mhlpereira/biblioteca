import { Test, TestingModule } from '@nestjs/testing';
import { FindAllReservationsUseCase } from '../usecase/finda-all-reservations.usecase';
import { ReservationOutPort } from '../ports/reservation-out.port';
import { ReservationListOutput } from '../ports/out/reservation-list-output';

describe('FindAllReservationsUseCase', () => {
  let useCase: FindAllReservationsUseCase;

  const mockReservationRepository: jest.Mocked<ReservationOutPort> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdWithBookCopy: jest.fn(),
    findAll: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllReservationsUseCase,
        { provide: 'IReservationRepository', useValue: mockReservationRepository },
      ],
    }).compile();

    useCase = module.get(FindAllReservationsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const paginatedResult = {
    data: [
      {
        id: 'res-1',
        clientName: 'Mario',
        bookTitle: 'Clean Code',
        bookImage: null,
        author: 'Robert Martin',
        reservedAt: new Date('2026-03-01'),
        dueDate: new Date('2026-03-08'),
        returnedAt: null,
        status: 'ACTIVE',
        fineAmount: null,
        isOverdue: false,
        potentialFine: 0,
      } as ReservationListOutput,
    ],
    meta: { total: 1, page: 1, lastPage: 1 },
  };

  it('should return paginated reservations with default page/limit', async () => {
    mockReservationRepository.findAll.mockResolvedValue(paginatedResult);

    const result = await useCase.execute({});

    expect(mockReservationRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
    expect(result).toEqual(paginatedResult);
  });

  it('should pass custom page and limit', async () => {
    mockReservationRepository.findAll.mockResolvedValue(paginatedResult);

    await useCase.execute({ page: 2, limit: 5 });

    expect(mockReservationRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5 }),
    );
  });

  it('should pass all filters to repository', async () => {
    mockReservationRepository.findAll.mockResolvedValue(paginatedResult);

    await useCase.execute({
      page: 1,
      limit: 10,
      clientId: 'client-1',
      bookId: 'book-1',
      status: 'ACTIVE',
      overdueOnly: true,
    });

    expect(mockReservationRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'client-1',
        bookId: 'book-1',
        status: 'ACTIVE',
        overdueOnly: true,
      }),
    );
  });
});
