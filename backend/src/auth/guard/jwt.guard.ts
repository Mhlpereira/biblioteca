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
        const url = request.url;
        
        console.log("\n🛡️  [JwtAuthGuard] Iniciando validação");
        console.log("📍 URL:", url);
        console.log("🔑 Headers recebidos:", {
            authorization: request.get("Authorization") ? "✅ Presente" : "❌ Ausente",
            xUserinfo: request.get("X-Userinfo") ? "✅ Presente" : "❌ Ausente",
        });

        const isPublic = this.reflector.getAllAndOverride<boolean>(PERMIT_ALL_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        
        if (isPublic) {
            console.log("🌐 Rota pública - liberando acesso");
            return true;
        }

        const authHeader = request.get("Authorization");
        if (!authHeader) {
            console.log("❌ Authorization header ausente");
            throw new UnauthorizedException("Token ausente");
        }

        console.log("🔍 Decodificando token JWT...");
        const token = authHeader.replace("Bearer ", "");
        const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf-8")) as KongUserinfo;

        console.log("👤 Payload decodificado:", {
            sub: payload.sub,
            email: payload.email,
            name: payload.given_name,
            preferred_username: payload.preferred_username,
        });

        const roles: string[] = payload.realm_access?.roles ?? [];
        const role = roles.includes("ADMIN") ? Role.ADMIN : Role.USER;

        console.log("🎭 Roles:", roles, "→ Role final:", role);

        request.user = {
            keycloakId: payload.sub,
            email: payload.email ?? "",
            name: payload.given_name ?? payload.name ?? "",
            lastName: payload.family_name ?? "",
            cpf: payload.preferred_username ?? "", 
            role,
            active: true,
        } satisfies AuthUser;

        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            console.log("✅ Sem restrição de roles - acesso liberado");
            return true;
        }
        
        if (!requiredRoles.includes(role)) {
            console.log("❌ Role insuficiente. Necessário:", requiredRoles, "Tem:", role);
            throw new UnauthorizedException("Acesso negado para esta role");
        }

        console.log("✅ Validação completa - acesso autorizado\n");
        return true;
    }
}
