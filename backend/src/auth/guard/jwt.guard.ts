import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            console.log("JWT ERR:", err);
            console.log("JWT INFO:", info); // aqui costuma vir "No auth token", "jwt issuer invalid", etc.
            throw err || new UnauthorizedException(info?.message || "Unauthorized");
        }
        return user;
    }
}
