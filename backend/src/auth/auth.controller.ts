import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RegisterOutputDto } from "./dto/output-register.dto";
import { Public } from "./decorators/public.decorator";

@Controller("auth")
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


}
