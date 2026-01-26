import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, UseGuards, Query } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { FindReservationDto } from "./dto/find-reservation.dto";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtPayload } from "../auth/types/jwt-payload.types";
import { PaginatedResponseDto } from "../common/dto/pagination-response.dto";
import { FindReservationResponseDto } from "./dto/find-response-reservation.dto";
import { ReturnReservetionDto } from "./dto/return-reservation.dto";
import { JwtAuthGuard } from "../auth/guard/jwt.guard";
import { DenyRoles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enum/role.enum";
import { CreateFullReservationDto } from "./dto/create-full-reservation.dto";
import { Public } from "../auth/decorators/public.decorator";

@Controller("reservation")
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    @Get("me")
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async findAuthClientReservations(
        @CurrentUser() user: JwtPayload
    ): Promise<PaginatedResponseDto<FindReservationResponseDto>> {
        return this.reservationService.findAuthClientReservation(user.sub);
    }

    @Post()
    @HttpCode(201)
    async create(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationService.create(createReservationDto);
    }

    @Get()
    @HttpCode(200)
    @Public()
    async findAll(
        @Query() findReservationDto: FindReservationDto
    ): Promise<PaginatedResponseDto<FindReservationResponseDto>> {
        return this.reservationService.findAll(findReservationDto);
    }

    @Get(":id")
    @HttpCode(200)
    async findOne(@Param("id") id: string) {
        return this.reservationService.findOne(id);
    }

    @Post("return")
    @HttpCode(200)
    async returnBook() {}

    @Patch(":id")
    @HttpCode(200)
    async update(@Param("id") id: string, @Body() updateReservationDto: UpdateReservationDto) {
        return this.reservationService.update(id, updateReservationDto);
    }

    @Delete(":id")
    @HttpCode(204)
    async remove(@Param() params: ReturnReservetionDto): Promise<void> {
        return this.reservationService.remove(params.id);
    }

    @Post("create")
    @HttpCode(201)
    @DenyRoles(Role.USER)
    async createFullreservation(@Body() dto: CreateFullReservationDto){
        return this.reservationService.createFullReservation(dto);

    }
}
