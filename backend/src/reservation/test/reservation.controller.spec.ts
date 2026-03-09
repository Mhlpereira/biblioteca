import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from '../reservation.controller';
import { CreateFullReservationUseCase } from '../usecase/create-full-reservation.usecase';
import { CreateReservationUseCase } from '../usecase/create-reservation.usecase';
import { FindAllReservationsUseCase } from '../usecase/find-all-reservations.usecase';
import { FindByUserIdReservationUseCase } from '../usecase/find-by-user-id-reservation.usecase';
import { RemoveReservationUseCase } from '../usecase/remove-reservation.usecase';
import { UpdateReservationUseCase } from '../usecase/update-reservation.usecase';
import { FindByIdReservationUseCase } from '../usecase/find-by-id-reservation.usecase';
import { ReservationStatus } from '../enum/reservation-status.enum';
import { AuthUser } from '../../auth/types/auth-user.types';

describe('ReservationController', () => {
  let controller: ReservationController;
  let createFullReservation: jest.Mocked<CreateFullReservationUseCase>;
  let createReservation: jest.Mocked<CreateReservationUseCase>;
  let findAllReservations: jest.Mocked<FindAllReservationsUseCase>;
  let findByUserIdReservation: jest.Mocked<FindByUserIdReservationUseCase>;
  let removeReservation: jest.Mocked<RemoveReservationUseCase>;
  let updateReservation: jest.Mocked<UpdateReservationUseCase>;
  let findByIdReservation: jest.Mocked<FindByIdReservationUseCase>;

  beforeEach(async () => {
    const mockCreateFullReservation = { execute: jest.fn() };
    const mockCreateReservation = { execute: jest.fn() };
    const mockFindAllReservations = { execute: jest.fn() };
    const mockFindByUserIdReservation = { execute: jest.fn() };
    const mockRemoveReservation = { execute: jest.fn() };
    const mockUpdateReservation = { execute: jest.fn() };
    const mockFindByIdReservation = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        { provide: CreateFullReservationUseCase, useValue: mockCreateFullReservation },
        { provide: CreateReservationUseCase, useValue: mockCreateReservation },
        { provide: FindAllReservationsUseCase, useValue: mockFindAllReservations },
        { provide: FindByUserIdReservationUseCase, useValue: mockFindByUserIdReservation },
        { provide: RemoveReservationUseCase, useValue: mockRemoveReservation },
        { provide: UpdateReservationUseCase, useValue: mockUpdateReservation },
        { provide: FindByIdReservationUseCase, useValue: mockFindByIdReservation },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    createFullReservation = module.get(CreateFullReservationUseCase);
    createReservation = module.get(CreateReservationUseCase);
    findAllReservations = module.get(FindAllReservationsUseCase);
    findByUserIdReservation = module.get(FindByUserIdReservationUseCase);
    removeReservation = module.get(RemoveReservationUseCase);
    updateReservation = module.get(UpdateReservationUseCase);
    findByIdReservation = module.get(FindByIdReservationUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAuthClientReservations', () => {
    it('should return reservations for authenticated user', async () => {
      const user = { keycloakId: 'user-123' } as AuthUser;
      const expectedResult = {
        data: [{ id: 'res-1', bookTitle: 'Clean Code' }],
        meta: { total: 1, page: 1, lastPage: 1 },
      };

      findByUserIdReservation.execute.mockResolvedValue(expectedResult as never);

      const result = await controller.findAuthClientReservations(user);

      expect(findByUserIdReservation.execute).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const dto = { keycloackClientId: 'user-123', bookId: 'book-1' };
      const expectedResult = {
        id: 'res-1',
        keycloackClientId: 'user-123',
        bookCopyId: 'copy-1',
        reservedAt: new Date(),
        dueDate: new Date(),
        status: ReservationStatus.ACTIVE,
      };

      createReservation.execute.mockResolvedValue(expectedResult as never);

      const result = await controller.create(dto);

      expect(createReservation.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 },
      };

      findAllReservations.execute.mockResolvedValue(expectedResult as never);

      const result = await controller.findAll(query);

      expect(findAllReservations.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('should pass filters to use case', async () => {
      const query = {
        page: 2,
        limit: 5,
        clientId: 'user-123',
        status: ReservationStatus.ACTIVE,
      };
      const expectedResult = {
        data: [],
        meta: { total: 0, page: 2, lastPage: 1 },
      };

      findAllReservations.execute.mockResolvedValue(expectedResult as never);

      const result = await controller.findAll(query);

      expect(findAllReservations.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      const expectedResult = {
        id: 'res-1',
        keycloackClientId: 'user-123',
        bookCopyId: 'copy-1',
        bookTitle: 'Clean Code',
        bookImage: 'image.png',
        reservedAt: new Date(),
        dueDate: new Date(),
        returnedAt: null,
        status: ReservationStatus.ACTIVE,
      };

      findByIdReservation.execute.mockResolvedValue(expectedResult as never);

      const result = await controller.findOne('res-1');

      expect(findByIdReservation.execute).toHaveBeenCalledWith('res-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a reservation', async () => {
      const dto = { status: ReservationStatus.RETURNED, daysLate: 2 };
      const expectedResult = {
        id: 'res-1',
        keycloackClientId: 'user-123',
        bookCopyId: 'copy-1',
        reservedAt: new Date(),
        dueDate: new Date(),
        status: ReservationStatus.RETURNED,
        daysLate: 2,
      };

      updateReservation.execute.mockResolvedValue(expectedResult as never);

      const result = await controller.update('res-1', dto);

      expect(updateReservation.execute).toHaveBeenCalledWith({ id: 'res-1', ...dto });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a reservation', async () => {
      const params = { id: 'res-1' };

      removeReservation.execute.mockResolvedValue(undefined);

      await controller.remove(params);

      expect(removeReservation.execute).toHaveBeenCalledWith(params);
    });
  });

  describe('createFullreservation', () => {
    it('should create a full reservation', async () => {
      const dto = {
        keycloackClientId: 'user-123',
        bookCopyId: 'copy-1',
        dueDate: '2026-04-01',
        status: ReservationStatus.ACTIVE,
      };
      const expectedResult = {
        id: 'res-1',
        keycloackClientId: 'user-123',
        bookCopyId: 'copy-1',
        reservedAt: new Date(),
        dueDate: new Date('2026-04-01'),
        status: ReservationStatus.ACTIVE,
      };

      createFullReservation.execute.mockResolvedValue(expectedResult as never);

      const result = await controller.createFullreservation(dto);

      expect(createFullReservation.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
