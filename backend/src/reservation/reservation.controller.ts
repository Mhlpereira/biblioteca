import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { FindReservationDto } from './dto/find-reservation.dto';
import { CurrentUser } from '../common/decorator/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.types';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  async creat(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.create(createReservationDto);
  }

  @Get()
  async findAllWithParameters(@Param() findReservationDto:FindReservationDto) {
    return this.reservationService.findAll(findReservationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reservationService.findOne(id);
  }

  @Get('me')
  async findAuthClientReservations(@CurrentUser() user: JwtPayload){
    return this.reservationService.findAuthClientReservation(user.sub);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationService.update(id, updateReservationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.reservationService.remove(id);
  }
}
