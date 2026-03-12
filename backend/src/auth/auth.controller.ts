import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { Public } from "./decorators/public.decorator";
import { Roles } from "./decorators/roles.decorator";
import { Role } from "./enum/role.enum";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ListUsersQueryDto } from "./dto/list-users.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get("me")
    getMe(@Req() req: Request) {
        return req["user"];
    }

    @Public()
    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Roles(Role.ADMIN)
    @Get("users")
    listUsers(@Query() query: ListUsersQueryDto) {
        return this.authService.listUsers(query.page, query.limit, query.search);
    }
}
