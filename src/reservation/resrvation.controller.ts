import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationInput } from './dto/reservation.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get('/:id')
  getReservation(@Param() { id }) {
    return this.reservationService.getReservation(id);
  }

  @Post('/:tourId')
  createReservation(@Param() { tourId }, @Body() body: CreateReservationInput) {
    return this.reservationService.createReservation(tourId, body);
  }

  @Get('/type/:tourId/:type')
  getReservationsByType(@Param() { tourId, type }) {
    return this.reservationService.getReservationsByType({ tourId, type });
  }
}
