import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../enum/role.enum";
import { DENY_ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const deniedRoles = this.reflector.getAllAndOverride<Role[]>(DENY_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // rota pública e sem usuário → deixa passar
        if (!user) return true;

        if (!deniedRoles || deniedRoles.length === 0) {
            return true;
        }

        return !deniedRoles.includes(user.role);
    }
}
