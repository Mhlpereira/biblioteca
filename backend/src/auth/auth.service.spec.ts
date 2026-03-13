import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const makeJsonResponse = (data: unknown, status = 200, headers: Record<string, string> = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  headers: {
    get: (key: string) => headers[key] ?? null,
  },
});

describe('AuthService', () => {
  let service: AuthService;

  const TOKEN = 'mock-admin-token';
  const USER_ID = 'user-uuid-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const values: Record<string, string> = {
                KEYCLOAK_BASE_URL: 'http://keycloak',
                KEYCLOAK_REALM: 'biblioteca',
                KC_ADMIN_CLIENT_ID: 'admin-client',
                KC_ADMIN_CLIENT_SECRET: 'admin-secret',
              };
              return values[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      cpf: '12345678901',
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const createResponse = makeJsonResponse({}, 201, {
        Location: `http://keycloak/admin/realms/biblioteca/users/${USER_ID}`,
      });
      const roleResponse = makeJsonResponse({ id: 'role-id', name: 'USER' });
      const assignResponse = makeJsonResponse({}, 204);

      mockFetch
        .mockResolvedValueOnce(tokenResponse)   // getAdminToken
        .mockResolvedValueOnce(createResponse)  // create user
        .mockResolvedValueOnce(roleResponse)    // get USER role
        .mockResolvedValueOnce(assignResponse); // assign role

      const result = await service.register(dto);

      expect(result).toEqual({ message: 'Usuário criado com sucesso', userId: USER_ID });
    });

    it('should handle 409 conflict - user already exists', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const conflictResponse = makeJsonResponse({}, 409);
      const existingUserResponse = makeJsonResponse([{ id: USER_ID }]);

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(conflictResponse)
        .mockResolvedValueOnce(existingUserResponse);

      const result = await service.register(dto);

      expect(result).toEqual({ message: 'Usuário já cadastrado', userId: USER_ID });
    });

    it('should throw ConflictException when 409 and user not found in lookup', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const conflictResponse = makeJsonResponse({}, 409);
      const emptyLookupResponse = makeJsonResponse([]);

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(conflictResponse)
        .mockResolvedValueOnce(emptyLookupResponse);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw error when admin token fetch fails', async () => {
      const failedTokenResponse = makeJsonResponse({ error: 'unauthorized' }, 401);

      mockFetch.mockResolvedValueOnce(failedTokenResponse);

      await expect(service.register(dto)).rejects.toThrow('Falha ao obter token de admin');
    });

    it('should throw error when user creation fails with non-409 error', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const serverErrorResponse = makeJsonResponse({ error: 'server error' }, 500);
      serverErrorResponse.text = jest.fn().mockResolvedValue('Internal Server Error');

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(serverErrorResponse);

      await expect(service.register(dto)).rejects.toThrow('Falha ao criar usuário');
    });

    it('should throw error when Location header is missing after user creation', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const createResponse = makeJsonResponse({}, 201); // no Location header

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(createResponse);

      await expect(service.register(dto)).rejects.toThrow(
        'Usuário criado, mas não foi possível obter o ID',
      );
    });

    it('should throw error when role fetch fails', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const createResponse = makeJsonResponse({}, 201, {
        Location: `http://keycloak/admin/realms/biblioteca/users/${USER_ID}`,
      });
      const roleFetchError = makeJsonResponse({ error: 'not found' }, 404);

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(createResponse)
        .mockResolvedValueOnce(roleFetchError);

      await expect(service.register(dto)).rejects.toThrow('Falha ao obter role USER');
    });

    it('should throw error when role assignment fails', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const createResponse = makeJsonResponse({}, 201, {
        Location: `http://keycloak/admin/realms/biblioteca/users/${USER_ID}`,
      });
      const roleResponse = makeJsonResponse({ id: 'role-id', name: 'USER' });
      const assignError = makeJsonResponse({ error: 'forbidden' }, 403);
      assignError.text = jest.fn().mockResolvedValue('Forbidden');

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(createResponse)
        .mockResolvedValueOnce(roleResponse)
        .mockResolvedValueOnce(assignError);

      await expect(service.register(dto)).rejects.toThrow('Falha ao atribuir role');
    });
  });

  describe('listUsers', () => {
    it('should return paginated users with roles', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const usersResponse = makeJsonResponse([
        {
          id: USER_ID,
          username: '12345678901',
          firstName: 'Test',
          lastName: 'User',
          enabled: true,
          attributes: { cpf: ['12345678901'] },
        },
      ]);
      const countResponse = makeJsonResponse(1);
      const rolesResponse = makeJsonResponse([{ id: 'role-id', name: 'ADMIN' }]);

      mockFetch
        .mockResolvedValueOnce(tokenResponse)  // getAdminToken
        .mockResolvedValueOnce(usersResponse)  // users list
        .mockResolvedValueOnce(countResponse)  // users count
        .mockResolvedValueOnce(rolesResponse); // roles for user

      const result = await service.listUsers(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        id: USER_ID,
        role: 'ADMIN',
      });
      expect(result.meta).toEqual({ total: 1, page: 1, lastPage: 1 });
    });

    it('should return USER role when user is not ADMIN', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const usersResponse = makeJsonResponse([
        {
          id: USER_ID,
          username: '12345678901',
          firstName: 'Test',
          lastName: 'User',
          enabled: true,
        },
      ]);
      const countResponse = makeJsonResponse(1);
      const rolesResponse = makeJsonResponse([{ id: 'role-id', name: 'USER' }]);

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(usersResponse)
        .mockResolvedValueOnce(countResponse)
        .mockResolvedValueOnce(rolesResponse);

      const result = await service.listUsers(1, 10);

      expect(result.data[0]).toMatchObject({ role: 'USER' });
    });

    it('should apply search param when provided', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const usersResponse = makeJsonResponse([]);
      const countResponse = makeJsonResponse(0);

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(usersResponse)
        .mockResolvedValueOnce(countResponse);

      await service.listUsers(1, 10, 'john');

      // Verify that search param is included in users URL
      const usersCallUrl = mockFetch.mock.calls[1][0] as string;
      expect(usersCallUrl).toContain('search=john');
    });

    it('should calculate lastPage correctly', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const usersResponse = makeJsonResponse([]);
      const countResponse = makeJsonResponse(25);

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(usersResponse)
        .mockResolvedValueOnce(countResponse);

      const result = await service.listUsers(1, 10);

      expect(result.meta.lastPage).toBe(3);
    });

    it('should use username as cpf fallback when attributes are missing', async () => {
      const tokenResponse = makeJsonResponse({ access_token: TOKEN });
      const usersResponse = makeJsonResponse([
        {
          id: USER_ID,
          username: 'fallback-cpf',
          enabled: true,
        },
      ]);
      const countResponse = makeJsonResponse(1);
      const rolesResponse = makeJsonResponse([]);

      mockFetch
        .mockResolvedValueOnce(tokenResponse)
        .mockResolvedValueOnce(usersResponse)
        .mockResolvedValueOnce(countResponse)
        .mockResolvedValueOnce(rolesResponse);

      const result = await service.listUsers(1, 10);

      expect(result.data[0]).toMatchObject({ cpf: 'fallback-cpf' });
    });
  });
});
