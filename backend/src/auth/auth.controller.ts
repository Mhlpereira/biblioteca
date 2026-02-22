import { Controller, Get, Post, Body, HttpCode, UseGuards, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "./guard/jwt.guard";
import { Response } from "express";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtPayload } from "./types/jwt-payload.types";
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get authenticated user" })
    @ApiResponse({ status: 200, description: "Authenticated user" })
    me(@CurrentUser() user: JwtPayload) {
        return this.authService.me(user);
    }

}
