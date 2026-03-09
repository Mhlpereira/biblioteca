import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, Query } from "@nestjs/common";
import { CreateReservationDto } from "./dto/request/create-reservation.dto";
import { UpdateReservationDto } from "./dto/request/update-reservation.dto";
import { FindReservationDto } from "./dto/query/find-reservation.dto";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user.types";
import { PaginatedResponseDto } from "../common/dto/pagination-response.dto";
import { FindReservationResponseDto } from "./dto/response/find-response-reservation.dto";
import { ReturnReservetionDto } from "./dto/request/return-reservation.dto";
import { JwtAuthGuard } from "../auth/guard/jwt.guard";
import { Role } from "../auth/enum/role.enum";
import { CreateFullReservationDto } from "./dto/request/create-full-reservation.dto";
import { Public } from "../auth/decorators/public.decorator";
import { CreateFullReservationUseCase } from "./usecase/create-full-reservation.usecase";
import { CreateReservationUseCase } from "./usecase/create-reservation.usecase";
import { FindAllReservationsUseCase } from "./usecase/find-all-reservations.usecase";
import { FindByUserIdReservationUseCase } from "./usecase/find-by-user-id-reservation.usecase";
import { RemoveReservationUseCase } from "./usecase/remove-reservation.usecase";
import { UpdateReservationUseCase } from "./usecase/update-reservation.usecase";
import { FindByIdReservationUseCase } from "./usecase/find-by-id-reservation.usecase";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("reservation")
export class ReservationController {
    constructor(
        private readonly createFullReservation: CreateFullReservationUseCase,
        private readonly createReservation: CreateReservationUseCase,
        private readonly findAllReservations: FindAllReservationsUseCase,
        private readonly findByUserIdReservation: FindByUserIdReservationUseCase,
        private readonly removeReservation: RemoveReservationUseCase,
        private readonly updateReservation: UpdateReservationUseCase,
        private readonly findByIdReservation: FindByIdReservationUseCase,

    ) {}

    @Get("me")
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async findAuthClientReservations(
        @CurrentUser() user: AuthUser
    ): Promise<PaginatedResponseDto<FindReservationResponseDto>> {
        return this.findByUserIdReservation.execute(user.keycloakId);
    }

    @Post()
    @HttpCode(201)
    async create(@Body() createReservationDto: CreateReservationDto) {
        return this.createReservation.execute(createReservationDto);
    }

    @Get()
    @HttpCode(200)
    @Public()
    async findAll(
        @Query() findReservationDto: FindReservationDto
    ): Promise<PaginatedResponseDto<FindReservationResponseDto>> {
        return this.findAllReservations.execute(findReservationDto);
    }

    @Get(":id")
    @HttpCode(200)
    async findOne(@Param("id") id: string) {
        return this.findByIdReservation.execute(id);
    }

    @Post("return")
    @HttpCode(200)
    async returnBook() {}

    @Patch(":id")
    @HttpCode(200)
    async update(@Param("id") id: string, @Body() updateReservationDto: UpdateReservationDto) {
        return this.updateReservation.execute({ id, ...updateReservationDto });
    }

    @Delete(":id")
    @HttpCode(204)
    async remove(@Param() params: ReturnReservetionDto): Promise<void> {
        return this.removeReservation.execute(params);
    }

    @Post("create")
    @HttpCode(201)
    @Roles(Role.ADMIN)
    async createFullreservation(@Body() dto: CreateFullReservationDto){
        return this.createFullReservation.execute(dto);
    }
}
