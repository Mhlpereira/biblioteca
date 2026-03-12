import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginatedResponseDto } from '../common/dto/pagination-response.dto';
import { RegisterDto } from './dto/register.dto';

interface KeycloakUser {
    id: string;
    username: string;
    attributes?: {
        cpf?: string[];
    };
    firstName?: string;
    lastName?: string;
    enabled: boolean;
}

interface KeycloakRole {
    id: string;
    name: string;
}

@Injectable()
export class AuthService {
    private readonly keycloakBaseUrl: string;
    private readonly realm: string;
    private readonly adminClientId: string;
    private readonly adminClientSecret: string;

    constructor(private readonly configService: ConfigService) {
        this.keycloakBaseUrl = this.configService.getOrThrow<string>('KEYCLOAK_BASE_URL');
        this.realm = this.configService.getOrThrow<string>('KEYCLOAK_REALM');
        this.adminClientId = this.configService.getOrThrow<string>('KC_ADMIN_CLIENT_ID');
        this.adminClientSecret = this.configService.getOrThrow<string>('KC_ADMIN_CLIENT_SECRET');
    }

    private async getAdminToken(): Promise<string> {
        const tokenUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`;

        const body = new URLSearchParams();
        body.set('grant_type', 'client_credentials');
        body.set('client_id', this.adminClientId);
        body.set('client_secret', this.adminClientSecret);

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(
                `Falha ao obter token de admin: ${response.status} | URL: ${tokenUrl} | client_id: ${this.adminClientId} | body: ${errorBody}`,
            );
        }

        const data = (await response.json()) as { access_token: string };
        return data.access_token;
    }

    async register(dto: RegisterDto): Promise<{ message: string; userId: string }> {
        const adminToken = await this.getAdminToken();
        const usersUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users`;

        const userPayload = {
            username: dto.cpf,
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            enabled: true,
            emailVerified: true,
            requiredActions: [],
            attributes: {
                cpf: [dto.cpf],
            },
            credentials: [
                {
                    type: 'password',
                    value: dto.password,
                    temporary: false,
                },
            ],
        };

        const createResponse = await fetch(usersUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userPayload),
        });

        if (createResponse.status === 409) {
            const existingResponse = await fetch(
                `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users?username=${encodeURIComponent(dto.cpf)}&exact=true`,
                { headers: { Authorization: `Bearer ${adminToken}` } },
            );
            const existing = (await existingResponse.json()) as { id: string }[];
            const userId = existing[0]?.id;
            if (!userId) {
                throw new ConflictException('Usuário já existe');
            }
            return { message: 'Usuário já cadastrado', userId };
        }

        if (!createResponse.ok) {
            const errorBody = await createResponse.text();
            throw new Error(`Falha ao criar usuário: ${createResponse.status} | ${errorBody}`);
        }

        const location = createResponse.headers.get('Location');
        if (!location) {
            throw new Error('Usuário criado, mas não foi possível obter o ID');
        }

        const userId = location.split('/').pop()!;

        const roleResponse = await fetch(
            `${this.keycloakBaseUrl}/admin/realms/${this.realm}/roles/USER`,
            { headers: { Authorization: `Bearer ${adminToken}` } },
        );

        if (!roleResponse.ok) {
            throw new Error(`Falha ao obter role USER: ${roleResponse.status}`);
        }

        const role = (await roleResponse.json()) as { id: string; name: string };

        const assignResponse = await fetch(
            `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([{ id: role.id, name: role.name }]),
            },
        );

        if (!assignResponse.ok) {
            const errorBody = await assignResponse.text();
            throw new Error(`Falha ao atribuir role: ${assignResponse.status} | ${errorBody}`);
        }

        return { message: 'Usuário criado com sucesso', userId };
    }

    async listUsers(
        page: number = 1,
        limit: number = 10,
        search?: string,
    ): Promise<PaginatedResponseDto<object>> {
        const adminToken = await this.getAdminToken();
        const base = `${this.keycloakBaseUrl}/admin/realms/${this.realm}`;

        const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
        const first = (page - 1) * limit;

        const [usersResponse, countResponse] = await Promise.all([
            fetch(`${base}/users?first=${first}&max=${limit}${searchParam}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            }),
            fetch(`${base}/users/count${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            }),
        ]);

        const users = (await usersResponse.json()) as KeycloakUser[];
        const total = (await countResponse.json()) as number;

        const usersWithRoles = await Promise.all(
            users.map(async user => {
                const rolesResponse = await fetch(
                    `${base}/users/${user.id}/role-mappings/realm`,
                    { headers: { Authorization: `Bearer ${adminToken}` } },
                );
                const roles = (await rolesResponse.json()) as KeycloakRole[];
                const isAdmin = roles.some(r => r.name === 'ADMIN');

                return {
                    id: user.id,
                    keycloakId: user.id,
                    name: user.firstName ?? '',
                    lastName: user.lastName ?? '',
                    cpf: user.attributes?.cpf?.[0] ?? user.username,
                    active: user.enabled,
                    role: isAdmin ? 'ADMIN' : 'USER',
                };
            }),
        );

        return {
            data: usersWithRoles,
            meta: {
                total,
                page,
                lastPage: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }
}
