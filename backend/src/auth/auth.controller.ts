import { Controller, Get, Post, Body, HttpCode, UseGuards, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RegisterOutputDto } from "./dto/register-output.dto";
import { Public } from "./decorators/public.decorator";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt/jwt.auth-guard";
import { Response } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtPayload } from "./types/jwt-payload.types";

@Controller("")
@Public()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    @HttpCode(201)
    @ApiOperation({ summary: "Create client" })
    @ApiResponse({ status: 201, description: "Created", type: RegisterOutputDto })
    async createClient(@Body() registerDto: RegisterDto) {
        return this.authService.createClient(registerDto);
    }

    @Post("login")
    @HttpCode(200)
    @ApiOperation({ summary: "Log in system" })
    @ApiResponse({ status: 200, description: "Logged" })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const logged = await this.authService.login(loginDto);

        res.cookie("access_token", logged.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 2 * 60 * 60 * 1000,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    @ApiOperation({ summary: "Get authenticated user" })
    @ApiResponse({ status: 200, description: "Authenticated user" })
    me(@CurrentUser() user: JwtPayload) {
        return this.authService.me(user);
    }

    @UseGuards(JwtAuthGuard)
    @Post("logout")
    @HttpCode(200)
    @ApiOperation({ summary: "logout" })
    @ApiResponse({ status: 204, description: "system logout" })
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });

        return { message: "Logout realizado com sucesso" };
    }
}
