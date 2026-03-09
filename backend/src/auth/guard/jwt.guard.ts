import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../enum/role.enum";
import { AuthUser } from "../types/auth-user.types";
import { PERMIT_ALL_KEY } from "../decorators/public.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        const isPublic = this.reflector.getAllAndOverride<boolean>(PERMIT_ALL_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const xUserinfo = request.get("X-Userinfo");
        if (!xUserinfo) {
            throw new UnauthorizedException("X-Userinfo header ausente");
        }

        const decoded = Buffer.from(xUserinfo, "base64").toString("utf-8");
        const payload = JSON.parse(decoded) as KongUserinfo;

        const roles: string[] = payload.realm_access?.roles ?? [];
        const role = roles.includes("ADMIN") ? Role.ADMIN : Role.USER;

        request.user = {
            keycloakId: payload.sub,
            email: payload.email ?? "",
            name: payload.given_name ?? payload.name ?? "",
            lastName: payload.family_name ?? "",
            cpf: payload.cpf ?? "",
            role,
            active: true,
        } satisfies AuthUser;

        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true; // sem decorator = acesso livre

        if (!requiredRoles.includes(role)) {
            throw new UnauthorizedException("Acesso negado para esta role");
        }

        return true;
    }
}
