import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { FindReservationDto } from "./dto/find-reservation.dto";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { JwtPayload } from "../auth/types/jwt-payload.types";
import { PaginationDto } from "../common/dto/pagination.dto";
import { FindReservetaionResponseDto } from "./dto/find-response-reservation.dto";
import { PaginatedResponseDto } from "../common/dto/pagination-response.dto";

@Controller("reservation")
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    @Post()
    @HttpCode(201)
    async create(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationService.create(createReservationDto);
    }

    @Get()
    @HttpCode(200)
    async findAllWithParameters(@Param() findReservationDto: FindReservationDto) {
        return this.reservationService.findAll(findReservationDto);
    }

    @Get(":id")
    @HttpCode(200)
    async findOne(@Param("id") id: string) {
        return this.reservationService.findOne(id);
    }

    @Get("me")
    @HttpCode(200)
    async findAuthClientReservations(@CurrentUser() user: JwtPayload): Promise<PaginatedResponseDto<FindReservetaionResponseDto>> {
        return this.reservationService.findAuthClientReservation(user.sub);
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
    async remove(@Param("id") id: string) {
        return this.reservationService.remove(id);
    }
}
