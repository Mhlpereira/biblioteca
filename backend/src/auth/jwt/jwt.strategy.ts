import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../types/jwt-payload.types";
import { AuthUser } from "../types/auth-user.types";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        const secret = config.get<string>("JWT_SECRET");

        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.access_token ?? null]),
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload): Promise<AuthUser> {
        return {
            userId: payload.sub,
            cpf: payload.cpf,
            name: payload.name,
        };
    }
}
