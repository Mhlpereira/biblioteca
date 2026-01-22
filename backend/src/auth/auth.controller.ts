import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RegisterOutputDto } from "./dto/register-output.dto";
import { Public } from "./decorators/public.decorator";
import { LoginDto } from "./dto/login.dto";

@Controller("")
@Public()
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post("register")
    @HttpCode(201)
    @ApiOperation({ summary: "Create client" })
    @ApiResponse({ status: 201, description: "Created", type: RegisterOutputDto})
    async createClient(@Body() registerDto: RegisterDto) {
        return this.authService.createClient(registerDto);
    }

    @Post("login")
    @HttpCode(200)
    @ApiOperation({ summary: "Log in system"})
    @ApiResponse({ status: 200, description: "Logged"})
    async login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }
}
