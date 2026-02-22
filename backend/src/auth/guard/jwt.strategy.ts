import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as jwksRsa from "jwks-rsa";
import { ConfigService } from "@nestjs/config";
import { AuthUser } from "../types/auth-user.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(config: ConfigService) {
        const issuer = config.get<string>("KEYCLOAK_ISSUER");
        const jwksUri = config.get<string>("KEYCLOAK_JWKS_URI");
        const audience = config.get<string>("KEYCLOAK_CLIENT_ID");

        if (!issuer || !jwksUri) {
            throw new Error("KEYCLOAK_ISSUER ou KEYCLOAK_JWKS_URI não definido");
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            algorithms: ["RS256"],
            issuer,
            secretOrKeyProvider: jwksRsa.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 10,
                jwksUri,
            }),
        });
    }

    async validate(payload: any): Promise<AuthUser> {
        const roles = payload?.realm_access?.roles ?? payload?.resource_access?.[payload?.azp]?.roles ?? [];

        return {
            sub: payload.sub,
            cpf: payload.cpf,
            email: payload.email,
            name: payload.name ?? payload.given_name ?? payload.preferred_username,
            lastName: payload.family_name ?? null,
            role: roles?.[0] ?? "USER",
            active: true,
        };
    }
}
