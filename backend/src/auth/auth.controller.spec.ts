import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ListUsersQueryDto } from './dto/list-users.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    listUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the user from the request', () => {
      const mockUser = {
        keycloakId: 'user-123',
        email: 'user@test.com',
        name: 'Test',
        lastName: 'User',
        cpf: '12345678900',
        role: 'USER',
        active: true,
      };
      const mockRequest = { user: mockUser } as any;

      const result = controller.getMe(mockRequest);

      expect(result).toEqual(mockUser);
    });

    it('should return undefined when no user on request', () => {
      const mockRequest = {} as any;

      const result = controller.getMe(mockRequest);

      expect(result).toBeUndefined();
    });
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto: RegisterDto = {
        cpf: '12345678900',
        email: 'user@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      };
      const expected = { message: 'Usuário criado com sucesso', userId: 'new-user-id' };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('listUsers', () => {
    it('should call authService.listUsers with pagination params and return result', async () => {
      const query: ListUsersQueryDto = { page: 2, limit: 5, search: 'test' };
      const expected = {
        data: [],
        meta: { total: 0, page: 2, lastPage: 1 },
      };
      authService.listUsers.mockResolvedValue(expected);

      const result = await controller.listUsers(query);

      expect(authService.listUsers).toHaveBeenCalledWith(2, 5, 'test');
      expect(result).toEqual(expected);
    });

    it('should call authService.listUsers without search param', async () => {
      const query: ListUsersQueryDto = { page: 1, limit: 10 };
      authService.listUsers.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 },
      });

      await controller.listUsers(query);

      expect(authService.listUsers).toHaveBeenCalledWith(1, 10, undefined);
    });
  });
});
