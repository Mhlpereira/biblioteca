import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from "@nestjs/common";
import { UpdateClientDto } from "./dto/update-client.dto";
import { ClientService } from "./client.service";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtPayload } from "../auth/types/jwt-payload.types";
import { DenyRoles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enum/role.enum";
import { FindClientDto } from "./dto/find-client.dto";
import { FindClientResponseDto } from "./dto/find-client-response.dto";
import { PaginatedResponseDto } from "../common/dto/pagination-response.dto";
import { Public } from "../auth/decorators/public.decorator";

@Controller("clients")
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    
    @Patch("me")
    @HttpCode(200)
    @ApiOperation({ summary: "Update authenticated client profile" })
    @ApiResponse({ status: 200, description: "Client profile updated" })
    @ApiResponse({ status: 400, description: "Invalid request data" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async update(@CurrentUser() user: JwtPayload, @Body() updateClientDto: UpdateClientDto) {
        return this.clientService.update(user.sub, updateClientDto);
    }
    
    @Patch("me/password")
    @HttpCode(204)
    @ApiOperation({ summary: "Change authenticated client password" })
    @ApiResponse({ status: 204, description: "Password changed successfully" })
    @ApiResponse({ status: 400, description: "Current password is invalid" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async changePassword(@CurrentUser() user: JwtPayload, @Body() updatePasswordDto: UpdatePasswordDto) {
        return this.clientService.changePassword(user.sub, updatePasswordDto);
    }
    
    @Delete("me")
    @HttpCode(204)
    @ApiOperation({ summary: "Delete authenticated client account" })
    @ApiResponse({ status: 204, description: "Client account deleted" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async remove(@CurrentUser() user: JwtPayload) {
        return this.clientService.deleteClient(user.sub);
    }
    
    @Get(":id")
    @ApiOperation({ summary: "Get client by id" })
    @ApiResponse({ status: 200, description: "Client found" })
    @ApiResponse({ status: 404, description: "Client not found" })
    async getById(@Param("id") id: string) {
        return this.clientService.findByIdorThrow(id);
    }

    @Get()
    @HttpCode(200)
    @DenyRoles(Role.USER)
    async findAll(@Query() findClintDto: FindClientDto): Promise<PaginatedResponseDto<FindClientResponseDto>>{
        return this.clientService.findAll(findClintDto);
    }
}
