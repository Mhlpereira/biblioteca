import { Injectable, ConflictException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class KeycloakService {
    constructor(private http: HttpService) {}

    private base = process.env.KEYCLOAK_BASE_URL!;
    private realm = process.env.KEYCLOAK_REALM!;
    private clientId = process.env.KC_ADMIN_CLIENT_ID!;
    private secret = process.env.KC_ADMIN_CLIENT_SECRET!;

    private async adminToken(): Promise<string> {
        const url = `${this.base}/realms/${this.realm}/protocol/openid-connect/token`;
        const body = new URLSearchParams();
        body.set("grant_type", "client_credentials");
        body.set("client_id", this.clientId);
        body.set("client_secret", this.secret);

        const res = await firstValueFrom(
            this.http.post(url, body.toString(), {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            })
        );
        return res.data.access_token;
    }

    async createUser(input: { cpf: string; password: string; name: string; lastName: string }) {
        const token = await this.adminToken();

        const createUrl = `${this.base}/admin/realms/${this.realm}/users`;

        try {
            const res = await firstValueFrom(
                this.http.post(
                    createUrl,
                    {
                        username: input.cpf,
                        enabled: true,
                        firstName: input.name,
                        lastName: input.lastName,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            const location = res.headers["location"];
            const userId = (location as string).split("/").pop();

            await firstValueFrom(
                this.http.put(
                    `${this.base}/admin/realms/${this.realm}/users/${userId}/reset-password`,
                    { type: "password", value: input.password, temporary: false },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            );

            return userId;
        } catch (e: any) {
            if (e?.response?.status === 409) throw new ConflictException("CPF já cadastrado no Keycloak.");
            throw e;
        }
    }
}
